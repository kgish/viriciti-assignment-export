import * as config from 'config';

const dbConfig = config.get('redis');

export const redisConfig = {
    type: dbConfig.type,
    host: process.env.REDIS_HOSTNAME || dbConfig.host,
    port: parseInt(process.env.REDIS_PORT, 10) || dbConfig.port,
    db: parseInt(process.env.REDIS_DB, 10) || dbConfig.db,
    password: process.env.REDIS_PASSWORD || dbConfig.password,
    keyPrefix: process.env.REDIS_PREFIX || dbConfig.prefix,
};
