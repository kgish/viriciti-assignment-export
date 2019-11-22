import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoClient } from 'mongodb';
import { RedisClient } from 'redis';
import { pipeline, Writable } from 'stream';
import { parallel } from 'async';

import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { GetVehiclesFilterDto } from './dto/get-vehicles-filter.dto';
import { VehicleRepository } from './vehicle.repository';
// import { VehicleStatus } from './vehicle-status.enum';
import { Vehicle } from './vehicle.entity';
import { mongoConfig } from '../config/mongodb.config';
import { redisConfig } from '../config/redis.config';
import { User } from '../auth/user.entity';

import { unwindStream } from '../lib/unwind.stream';

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
    private mongoClient: MongoClient;
    private redisClient: RedisClient;

    private vehicles: IVehicle[] = [
        { id: 1001, name: 'vehicle_001' },
        { id: 1002, name: 'vehicle_002' },
        { id: 1003, name: 'vehicle_003' },
    ];

    constructor(
        @InjectRepository(VehicleRepository)
        private vehicleRepository: VehicleRepository,
    ) {
        // Connect to MongoDB
        this.logger.log(`mongoConfig='${ JSON.stringify(mongoConfig) }'`);
        const uri = `mongodb://${ mongoConfig.username }:${ mongoConfig.password }@${ mongoConfig.host }:${ mongoConfig.port }`;
        MongoClient.connect(uri, mongoConfig.settings, (error, client) => {
            if (error) {
                this.logger.error(`Cannot connect to mongo, error='${ error.message }'`);
            } else {
                this.logger.log(`Connected to mongo database`);
                this.mongoClient = client;
            }
        });

        // Connect to Redis
        this.logger.log(`redisConfig='${ JSON.stringify(redisConfig) }'`);

        try {
            this.redisClient = new RedisClient(redisConfig);
            this.logger.log(`Connected to redis cache`);
        } catch (error) {
            this.logger.error(`Cannot connect to redis, error='${ error.message }'`);
        }
    }

    getVehicles(
        filterDto: GetVehiclesFilterDto,
        user: User,
    ): Promise<IVehicle[]> {
        // return this.taskRepository.getTasks(filterDto, user);
        return Promise.resolve(this.vehicles);
    }

    async getVehicleById(
        id: number,
        user: User,
    ): Promise<IVehicle> {
        // const found = await this.vehicleRepository.findOne({ where: { id, userId: user.id } });
        const found = this.vehicles.find(v => v.id === +id);

        if (!found) {
            throw new NotFoundException(`Vehicle with ID '${ id }' not found`);
        }

        return found;
    }

    async getVehicleValuesById(
        id: number,
        user: User,
        fromDate: string,
        toDate: string,
    ): Promise<any> {
        const vehicle = this.vehicles.find(v => v.id === +id);

        if (!vehicle) {
            throw new NotFoundException(`Vehicle with ID '${ id }' not found`);
        }

        const message = `getVehicleValues() vehicle='${ vehicle.name }'`;
        // const fromDate = '2018-10-01';
        // const toDate = '2018-10-02';
        const fromMS = +(new Date(fromDate));
        const toMS = +(new Date(toDate));

        return new Promise((resolve, reject) => {
            const values = {};

            parallel([
                    callback => this._getVehicleStats(this.mongoClient, vehicle, 'soc', fromMS, toMS, values, callback),
                    callback => this._getVehicleStats(this.mongoClient, vehicle, 'speed', fromMS, toMS, values, callback),
                    callback => this._getVehicleStats(this.mongoClient, vehicle, 'current', fromMS, toMS, values, callback),
                    callback => this._getVehicleStats(this.mongoClient, vehicle, 'odo', fromMS, toMS, values, callback),
                    callback => this._getVehicleStats(this.mongoClient, vehicle, 'voltage', fromMS, toMS, values, callback),
                ], error => {
                    if (error) {
                        this.logger.error(`${ message } => NOK (${ error.message })`);
                        reject('NOK');
                    } else {
                        this.logger.log(`${ message } => OK`);
                        resolve(this._convertValues(values));
                    }
                },
            );
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

    _convertValues(values: any): IValue[] {
        const result: IValue[] = [];
        const times = Object.keys(values).sort();

        this.logger.log(`_convertValues() times=${ times.length }`);

        times.forEach(time => {
            const next = values[time];
            if (next) {
                const v = next.values;
                result.push({
                    time: +time,
                    soc: v.soc,
                    speed: v.speed,
                    current: v.current,
                    odo: v.odo,
                    voltage: v.voltage,
                });
            }
        });
        this.logger.log('_convertValues() => DONE');
        return result;
    }
}
