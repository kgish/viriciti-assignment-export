import { Module } from '@nestjs/common';
import { HealthCheckController } from './health-check.controller';

@Module({
    imports: [
        HealthCheckController,
    ],
    controllers: [ HealthCheckController ],
    providers: [ HealthCheckController ],
})
export class HealthCheckModule {
}
