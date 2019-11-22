import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateLimiterModule, RateLimiterInterceptor } from 'nestjs-rate-limiter';

import { AuthModule } from './auth/auth.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { TasksModule } from './tasks/tasks.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { VerifyTokenModule } from './verify-token/verify-token.module';

import { typeOrmConfig } from './config/typeorm.config';
import { redisConfig } from './config/redis.config';
import { rateLimiterConfig } from './config/rate-limiter.config';

@Module({
    imports: [
        AuthModule,
        HealthCheckModule,
        RateLimiterModule.register(rateLimiterConfig),
        TasksModule,
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
