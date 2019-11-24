import { Module } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleRepository } from './vehicle.repository';
import { AuthModule } from '../auth/auth.module';

import { MongodbModule, RedisModule } from '../microservices';

@Module({
    imports: [
        TypeOrmModule.forFeature([ VehicleRepository ]),
        AuthModule,
        MongodbModule,
        RedisModule,
    ],
    controllers: [ VehiclesController ],
    providers: [ VehiclesService ],
})
export class VehiclesModule {
}
