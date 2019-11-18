import {
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { IValue, IVehicle, VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { VehicleStatusValidationPipe } from './pipes/vehicle-status-validation.pipe';
import { GetVehiclesFilterDto } from './dto/get-vehicles-filter.dto';
import { Vehicle } from './vehicle.entity';
import { VehicleStatus } from './vehicle-status.enum';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';

@Controller('vehicles')
// @UseGuards(AuthGuard())
export class VehiclesController {

    private logger = new Logger('VehiclesController');

    constructor(private vehiclesService: VehiclesService) {
    }

    @Get()
    getVehicles(
        @Query(ValidationPipe) filterDto: GetVehiclesFilterDto,
        @GetUser() user: User,
    ): Promise<IVehicle[]> {
        this.logger.verbose(`User '${ user.username }' retrieving all vehicles. Filters: ${ JSON.stringify({ filterDto }) }`);
        return this.vehiclesService.getVehicles(filterDto, user);
    }

    @Get('/:id')
    getVehicleById(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User,
    ): Promise<IVehicle> {
        this.logger.verbose(`User '${ user.username }' getting a vehicle. Id: ${ id }`);
        return this.vehiclesService.getVehicleById(id, user);
    }

    @Get('/:id/values')
    getVehicleValuesById(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User,
    ): Promise<IValue[]> {
        this.logger.verbose(`User '${ user.username }' getting vehicle values. Id: ${ id }`);
        return this.vehiclesService.getVehicleValuesById(id, user);
    }

    // @Post()
    // @UsePipes(ValidationPipe)
    // createVehicle(
    //     @Body() createvehicleDto: CreateVehicleDto,
    //     @GetUser() user: User,
    // ): Promise<Vehicle> {
    //     this.logger.verbose(`User '${ user.username }' creating a new vehicle. Data: ${ JSON.stringify({ createvehicleDto }) }`);
    //     return this.vehiclesService.createVehicle(createvehicleDto, user);
    // }
    //
    // @Delete('/:id')
    // deleteVehicle(
    //     @Param('id', ParseIntPipe) id: number,
    //     @GetUser() user: User,
    // ): Promise<void> {
    //     this.logger.verbose(`User '${ user.username }' deleting a vehicle. Id: ${ id }`);
    //     return this.vehiclesService.deleteVehicle(id, user);
    // }
    //
    // @Patch('/:id/status')
    // updateVehicleStatus(
    //     @Param('id', ParseIntPipe) id: number,
    //     @Body('status', VehicleStatusValidationPipe) status: VehicleStatus,
    //     @GetUser() user: User,
    // ): Promise<Vehicle> {
    //     this.logger.verbose(`User '${ user.username }' changing a vehicle status. Id: ${ id }, Status: ${ status }`);
    //     return this.vehiclesService.updateVehicleStatus(id, status, user);
    // }
}
