import { Injectable, Logger } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import { mongoConfig } from '../../config/mongodb.config';
import { IVehicle } from '../../vehicles/vehicles.service';

@Injectable()
export class MongodbService {

    client: MongoClient;

    private logger = new Logger('MongodbService');
    private vehicles: IVehicle[] = [];

    constructor() {
        this._init();
    }

    getVehicles(): IVehicle[] {
        return [ ...this.vehicles ];
    }

    // Private

    _init() {
        this.logger.log(`mongoConfig='${ JSON.stringify(mongoConfig) }'`);
        const uri = `mongodb://${ mongoConfig.username }:${ mongoConfig.password }@${ mongoConfig.host }:${ mongoConfig.port }`;
        MongoClient.connect(uri, mongoConfig.settings, (error, client) => {
            if (error) {
                this.logger.error(`Cannot connect to mongo, error='${ error.message }'`);
            } else {
                this.logger.log(`Connected to mongo database, yay!`);
                client.db().admin().listDatabases().then(results => {
                    const ignore = [ 'admin', 'config', 'local' ];
                    const names = results.databases.map(result => result.name).filter(n => !ignore.includes(n));
                    let count = 1;
                    names.forEach(name => {
                        this.vehicles.push({ id: 1000 + count, name });
                        count++;
                    });
                    this.logger.log(`vehicles='${ JSON.stringify(this.vehicles) }'`);
                });
                this.client = client;
            }
        });
    }
}
