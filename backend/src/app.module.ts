import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateLimiterModule, RateLimiterInterceptor } from 'nestjs-rate-limiter';

import { AuthModule } from './auth/auth.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { VerifyTokenModule } from './verify-token/verify-token.module';

import { MongodbModule, RedisModule } from './microservices';

import { typeOrmConfig } from './config/typeorm.config';
import { rateLimiterConfig } from './config/rate-limiter.config';

@Module({
    imports: [
        AuthModule,
        HealthCheckModule,
        MongodbModule,
        RateLimiterModule.register(rateLimiterConfig),
        RedisModule,
        TypeOrmModule.forRoot(typeOrmConfig),
        VehiclesModule,
        VerifyTokenModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: RateLimiterInterceptor,
        },
    ],
})
export class AppModule {
}
