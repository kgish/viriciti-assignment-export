import * as config from 'config';

const dbConfig = config.get('db').mongo;

export const mongoConfig = {
    type: dbConfig.type,
    host: process.env.MONGO_HOSTNAME || dbConfig.host,
    port: process.env.MONGO_PORT || dbConfig.port,
    username: process.env.MONGO_USERNAME || dbConfig.username,
    password: process.env.MONGO_PASSWORD || dbConfig.password,
    settings: {
        useUnifiedTopology: process.env.MONGO_SETTINGS_USE_UNIFIED_TOPOLOGY || dbConfig.settings.useUnifiedTopology,
        connectTimeoutMS: process.env.MONGO_SETTINGS_CONNECT_TIMEOUT_MS || dbConfig.settings.connectTimeoutMS,
        socketTimeoutMS: process.env.MONGO_SETTINGS_SOCKET_TIMEOUT_MS || dbConfig.settings.socketTimeoutMS,
    },
};
