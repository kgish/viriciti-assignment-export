import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { GetVehiclesFilterDto } from './dto/get-vehicles-filter.dto';
import { VehicleRepository } from './vehicle.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle } from './vehicle.entity';
import { VehicleStatus } from './vehicle-status.enum';
import { User } from '../auth/user.entity';

import { MongoClient } from 'mongodb';
import { mongoConfig } from '../config/mongodb.config';
import { pipeline, Writable } from 'stream';
import { parallel } from 'async';
import { unwindStream } from '../../../tooling/src/unwind.stream';

export interface IVehicle {
    id: number;
    name: string;
}

export interface IValue {
    time: number;
    soc: number;
    speed: number;
    current: number;
    odo: number;
    voltage: number;
}

@Injectable()
export class VehiclesService {

    private logger = new Logger('VehiclesService');
    private client: MongoClient;

    private vehicles: IVehicle[] = [
        { id: 1001, name: 'vehicle_001' },
        { id: 1002, name: 'vehicle_002' },
        { id: 1003, name: 'vehicle_003' },
    ];

    constructor(
        @InjectRepository(VehicleRepository)
        private vehicleRepository: VehicleRepository,
    ) {
        const uri = `mongodb://${ mongoConfig.username }:${ mongoConfig.password }@${ mongoConfig.host }:${ mongoConfig.port }`;
        MongoClient.connect(uri, mongoConfig.settings, (error, client) => {
            if (error) {
                this.logger.error(`Cannot connect to mongo, error='${ error.message }'`);
            } else {
                this.logger.log(`Connected to mongo database`);
                this.client = client;
            }
        });
    }

    getVehicles(
        filterDto: GetVehiclesFilterDto,
        user: User,
    ): Promise<IVehicle[]> {
        return Promise.resolve(this.vehicles);
    }

    async getVehicleById(
        id: number,
        user: User,
    ): Promise<IVehicle> {
        const found = this.vehicles.find(v => v.id === +id);

        if (!found) {
            throw new NotFoundException(`Vehicle with ID '${ id }' not found`);
        }

        return Promise.resolve(found);
    }

    async getVehicleValuesById(
        id: number,
        user: User,
    ): Promise<any> {
        const vehicle = this.vehicles.find(v => v.id === +id);

        if (!vehicle) {
            throw new NotFoundException(`Vehicle with ID '${ id }' not found`);
        }

        const message = `getVehicleValues() vehicle='${ vehicle.name }'`;
        const fromDate = '2018-10-01';
        const toDate = '2018-10-02';
        const fromMS = +(new Date(fromDate));
        const toMS = +(new Date(toDate));

        const results = {};

        parallel({
                soc: callback => this._getVehicleStats(this.client, vehicle, 'soc', fromMS, toMS, results, callback),
                speed: callback => this._getVehicleStats(this.client, vehicle, 'speed', fromMS, toMS, results, callback),
                current: callback => this._getVehicleStats(this.client, vehicle, 'current', fromMS, toMS, results, callback),
                odo: callback => this._getVehicleStats(this.client, vehicle, 'odo', fromMS, toMS, results, callback),
                voltage: callback => this._getVehicleStats(this.client, vehicle, 'voltage', fromMS, toMS, results, callback),
            },
            (error) => {
                if (error) {
                    this.logger.error(`${ message } => NOK (${ error.message })`);
                } else {
                    this.logger.error(`${ message } => OK`);
                }
                return results;
            },
        );
    }

    // Private

    _getVehicleStats(client: MongoClient, vehicle: IVehicle, attribute: string, fromMS: number, toMS: number,
                     results: any, callback: (error: NodeJS.ErrnoException | null) => void) {
        const collection = client
            .db(vehicle.name)
            .collection(attribute);

        const source = unwindStream(collection, fromMS, toMS);

        const sink = new Writable({
            objectMode: true,
            write(point, enc, cb) {
                const { time, value } = point;
                if (!results[time]) {
                    results[time] = {};
                    results[time].values = { soc: null, speed: null, current: null, odo: null, voltage: null };
                }
                results[time].values[attribute] = value;
                cb();
            },
        });

        pipeline([
            source,
            sink,
        ], (error: NodeJS.ErrnoException | null) => {
            if (error) {
                this.logger.log(`getStats(${ attribute }) => NOK (${ error.message })`);
            } else {
                this.logger.log(`getStats(${ attribute }) => OK`);
            }
            callback(error);
        });
    }

    // async getVehicleById(
    //     id: number,
    //     user: User,
    // ): Promise<Vehicle> {
    //     const found = await this.vehicleRepository.findOne({ where: { id, userId: user.id } });
    //
    //     if (!found) {
    //         throw new NotFoundException(`Vehicle with ID '${ id }' not found`);
    //     }
    //
    //     return found;
    // }

    async createVehicle(
        createVehicleDto: CreateVehicleDto,
        user: User,
    ): Promise<Vehicle> {
        return this.vehicleRepository.createVehicle(createVehicleDto, user);
    }

    async deleteVehicle(
        id: number,
        user: User,
    ): Promise<void> {
        const result = await this.vehicleRepository.delete({ id, userId: user.id });

        if (result.affected === 0) {
            throw new NotFoundException(`Vehicle with ID '${ id }' not found`);
        }
    }

    // async updateVehicleStatus(
    //     id: number,
    //     status: VehicleStatus,
    //     user: User,
    // ): Promise<Vehicle> {
    //     const vehicle = await this.getVehicleById(id, user);
    //     vehicle.status = status;
    //     await vehicle.save();
    //     return vehicle;
    // }
}
