import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateLimiterModule, RateLimiterInterceptor } from 'nestjs-rate-limiter';

import { TasksModule } from './tasks/tasks.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { AuthModule } from './auth/auth.module';

import { typeOrmConfig } from './config/typeorm.config';
import { rateLimiterConfig } from './config/rate-limiter.config';

@Module({
    imports: [
        AuthModule,
        RateLimiterModule.register(rateLimiterConfig),
        TasksModule,
        TypeOrmModule.forRoot(typeOrmConfig),
        VehiclesModule,
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
