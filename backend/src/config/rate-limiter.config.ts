import * as config from 'config';

const rlConfig = config.get('rate-limiter');

export const rateLimiterConfig = {
    type: process.env.RATE_LIMITER_TYPE || rlConfig.type,
    points: process.env.RATE_LIMITER_POINTS || rlConfig.points,
    duration: process.env.RATE_LIMITER_DURATION || rlConfig.duration,
    keyprefix: process.env.RATE_LIMITER_KEYPREFIX || rlConfig.keyprefix,
};
