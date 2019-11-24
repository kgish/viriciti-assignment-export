import { Injectable, Logger } from '@nestjs/common';
import { RedisClient } from 'redis';

import { redisConfig } from '../../config/redis.config';

@Injectable()
export class RedisService {

    client: RedisClient;

    private logger = new Logger('RedisService');

    constructor() {
        this._init();
    }

    // Private

    _init() {

        this.logger.log(`redisConfig='${ JSON.stringify(redisConfig) }'`);
        try {
            this.client = new RedisClient(redisConfig);
            this.logger.log(`Connected to redis cache, yay!`);
        } catch (error) {
            this.logger.error(`Cannot connect to redis, error='${ error.message }'`);
        }
    }
}
