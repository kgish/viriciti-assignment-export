import {
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    ParseIntPipe,
    // Patch,
    Post,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { IValue, IVehicle, VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
// import { VehicleStatusValidationPipe } from './pipes/vehicle-status-validation.pipe';
import { GetVehiclesFilterDto } from './dto/get-vehicles-filter.dto';
import { Vehicle } from './vehicle.entity';
// import { VehicleStatus } from './vehicle-status.enum';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';

@Controller('vehicles')
@UseGuards(AuthGuard())
export class VehiclesController {

    private logger = new Logger('VehiclesController');

    constructor(private vehiclesService: VehiclesService) {
    }

    @Get('/:id/values')
    getVehicleValuesById(
        @Query('fromDate') fromDate,
        @Query('toDate') toDate,
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User,
    ): Promise<IValue[]> {
        this.logger.log(`getVehicleValuesById() user='${ user }' id='${ id }' fromDate='${ fromDate }' toDate='${ toDate }'`);
        return this.vehiclesService.getVehicleValuesById(id, user, fromDate, toDate);
    }

    @Post()
    @UsePipes(ValidationPipe)
    createVehicle(
        @Body() createvehicleDto: CreateVehicleDto,
        @GetUser() user: User,
    ): Promise<Vehicle> {
        this.logger.log(`createVehicle() user='${ user }' createVehicleDto='${ JSON.stringify({ createvehicleDto }) }'`);
        return this.vehiclesService.createVehicle(createvehicleDto, user);
    }

    @Delete('/:id')
    deleteVehicle(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User,
    ): Promise<void> {
        this.logger.log(`deleteVehicle() user='${ user }' id='${ id }'`);
        return this.vehiclesService.deleteVehicle(id, user);
    }

    // @Patch('/:id/status')
    // updateVehicleStatus(
    //     @Param('id', ParseIntPipe) id: number,
    //     @Body('status', VehicleStatusValidationPipe) status: VehicleStatus,
    //     @GetUser() user: User,
    // ): Promise<Vehicle> {
    //     this.logger.log(`updateVehicleStatus() user='${ user }' id='${ id }' status='${ status }'`);
    //     return this.vehiclesService.updateVehicleStatus(id, status, user);
    // }
}
