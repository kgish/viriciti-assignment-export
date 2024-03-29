import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { pipeline, Writable } from 'stream';
import { parallel } from 'async';

import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { GetVehiclesFilterDto } from './dto/get-vehicles-filter.dto';
import { VehicleRepository } from './vehicle.repository';
// import { VehicleStatus } from './vehicle-status.enum';
import { Vehicle } from './vehicle.entity';
import { User } from '../auth/user.entity';

import { dateYYYYMMDD, unwindStream } from '../lib/utils';

import { MongodbService, RedisService } from '../microservices';
import { RedisClient } from 'redis';
import { MongoClient } from 'mongodb';

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

interface IBlock {
    fromDate: string;
    toDate: string;
}

const MSECS_PER_DAY = (1000 * 60 * 60 * 24);

@Injectable()
export class VehiclesService {

    private logger = new Logger('VehiclesService');
    private mongoClient: MongoClient;
    private redisClient: RedisClient;

    private vehicles: IVehicle[];

    constructor(
        @InjectRepository(VehicleRepository)
        private vehicleRepository: VehicleRepository,
        private mongodb: MongodbService,
        private redis: RedisService,
    ) {
        this.redisClient = redis.client;
        this.mongoClient = mongodb.client;
        this.vehicles = mongodb.getVehicles();
    }

    getVehicles(
        filterDto: GetVehiclesFilterDto,
        user: User,
    ): Promise<IVehicle[]> {
        // return this.taskRepository.getVehicles(filterDto, user);
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
        const fn = `getVehicleValues() vehicle='${ vehicle.name }'`;

        if (!vehicle) {
            throw new NotFoundException(`Vehicle with ID '${ id }' not found`);
        }

        const fromMS = +(new Date(fromDate));
        const toMS = +(new Date(toDate));

        let blocks: IBlock[];
        const days = (toMS - fromMS) / MSECS_PER_DAY;
        this.logger.log(`${ fn } days='${ days }'`);

        if (days === 1) {
            blocks = [ { fromDate, toDate } ];
        } else {
            blocks = [];
            for (let t = fromMS; t < toMS; t += MSECS_PER_DAY) {
                blocks.push({
                    fromDate: dateYYYYMMDD(new Date(t)),
                    toDate: dateYYYYMMDD(new Date(t + MSECS_PER_DAY)),
                });
            }
        }

        this.logger.log(`${ fn } n=${ blocks.length } blocks='${ JSON.stringify(blocks) }'`);

        const promises = [];

        blocks.forEach(block => {
            const from = block.fromDate;
            const to = block.toDate;
            promises.push(
                new Promise((resolve, reject) => resolve(this._getVehicleStatsPerDay(vehicle, from, to))),
            );
        });

        // return this._getVehicleStatsPerDay(vehicle, fromDate, toDate);
        return new Promise((resolve, reject) => {
            Promise.all(promises).then(arrays => {
                let result = [];
                if (arrays.length === 1) {
                    result = arrays[0];
                } else {
                    this.logger.log(`${ fn } => OK`);
                    arrays.forEach(array => array.forEach(item => result.push(item)));
                }
                resolve(result);
            }).catch(error => {
                this.logger.error(`${ fn } => NOK error='${ error }'`);
                reject(error);
            });
        });
    }

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

    _getVehicleStatsPerDay(vehicle: IVehicle, fromDate: string, toDate: string) {

        const fn = `_getVehicleStatsPerDay() vehicle='${ vehicle.name }'`;

        const fromMS = +(new Date(fromDate));
        const toMS = +(new Date(toDate));

        return new Promise((resolve, reject) => {

            const rid = `${ vehicle.name }.${ fromDate.replace('-', '') }.${ toDate.replace('-', '') }`;
            this.redisClient.get(rid, (err, reply) => {
                if (err) {
                    this.logger.log(`${ fn } rid='${ rid }' error='${ JSON.stringify(err) }'`);
                } else {
                    if (reply) {
                        this.logger.log(`${ fn } rid='${ rid }' => HIT`);
                        resolve(JSON.parse(reply));
                    } else {
                        this.logger.log(`${ fn } rid='${ rid }' => MISS`);
                    }
                }

                if (err || !reply) {

                    const values = {};

                    parallel([
                            callback => this._getVehicleStats(this.mongoClient, vehicle, 'soc', fromMS, toMS, values, callback),
                            callback => this._getVehicleStats(this.mongoClient, vehicle, 'speed', fromMS, toMS, values, callback),
                            callback => this._getVehicleStats(this.mongoClient, vehicle, 'current', fromMS, toMS, values, callback),
                            callback => this._getVehicleStats(this.mongoClient, vehicle, 'odo', fromMS, toMS, values, callback),
                            callback => this._getVehicleStats(this.mongoClient, vehicle, 'voltage', fromMS, toMS, values, callback),
                        ], error => {
                            if (error) {
                                this.logger.error(`${ fn } => NOK (${ error.message })`);
                                reject('NOK');
                            } else {
                                this.logger.log(`${ fn } => OK`);
                                const converted = this._convertValues(values);
                                this.redisClient.set(rid, JSON.stringify(converted));
                                resolve(converted);
                            }
                        },
                    );
                }
            });
        });

    }

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
