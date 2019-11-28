import { Test } from '@nestjs/testing';
import { VehiclesService } from './vehicles.service';
import { VehicleRepository } from './vehicle.repository';
import { GetVehiclesFilterDto } from './dto/get-vehicles-filter.dto';
import { VehicleStatus } from './vehicle-status.enum';
import { NotFoundException } from '@nestjs/common';

// TODO: BACKEND Implement vehicle service tests backend
describe('VehicleService', () => {
    let vehiclesService;
    let vehicleRepository;

    const mockUser = { id: 12, username: 'Test user' };

    const mockVehicleRepository = () => ({
        getVehicles: jest.fn(),
        findOne: jest.fn(),
        createVehicle: jest.fn(),
        delete: jest.fn(),
    });

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                VehiclesService,
                { provide: VehicleRepository, useFactory: mockVehicleRepository },
            ],
        }).compile();

        vehiclesService = await module.get<VehiclesService>(VehiclesService);
        vehicleRepository = await module.get<VehicleRepository>(VehicleRepository);
    });

    describe('getVehicles', () => {
        xit('gets all vehicless from repository', async () => {
            vehicleRepository.getVehicles.mockResolvedValue('someValue');

            expect(vehicleRepository.getVehicles).not.toHaveBeenCalled();

            const filters: GetVehiclesFilterDto = { status: VehicleStatus.READY, search: 'Something to search' };
            const result = await vehiclesService.getVehicles(filters, mockUser);
            vehiclesService.getVehicles(filters, mockUser);
            expect(vehicleRepository.getVehicles).toHaveBeenCalled();
            expect(result).toEqual('someValue');
        });
    });

    describe('getVehiclesById', () => {
        xit('calls vehicleRepository.findOne() and successfully retrieve and return the vehicle', async () => {
            const mockVehicle = { title: 'Test vehicle', description: 'Vehicle description' };
            vehicleRepository.findOne.mockResolvedValue(mockVehicle);

            const result = await vehiclesService.getVehicleById(1, mockUser);
            expect(result).toEqual(mockVehicle);

            expect(vehicleRepository.findOne).toHaveBeenCalledWith({ where: { id: 1, userId: mockUser.id } });

        });

        xit('throws as error if vehicle not found', () => {
            vehicleRepository.findOne.mockResolvedValue(null);
            expect(vehiclesService.getVehicleById(1, mockUser)).rejects.toThrow(NotFoundException);
        });
    });

    describe('createVehicle', () => {

        xit('calls vehicleRepository.createVehicle() and returns the result', async () => {
            const createVehicleDTO = { title: 'Vehicle title', description: 'Vehicle description' };
            vehicleRepository.createVehicle.mockResolvedValue('someValue');
            expect(vehicleRepository.createVehicle).not.toHaveBeenCalled();
            const result = await vehiclesService.createVehicle(createVehicleDTO, mockUser);
            expect(vehicleRepository.createVehicle).toHaveBeenCalledWith(createVehicleDTO, mockUser);
            expect(result).toEqual('someValue');
        });
    });

    describe('deleteVehicle', () => {

        xit('calls vehicleRepository.deleteVehicle() and returns the result', async () => {
            vehicleRepository.delete.mockResolvedValue({ affected: 1 });
            expect(vehicleRepository.delete).not.toHaveBeenCalled();
            await vehiclesService.deleteVehicle(1, mockUser);
            expect(vehicleRepository.delete).toHaveBeenCalledWith({ id: 1, userId: mockUser.id });
        });

        xit('throws as error if vehicle not found', () => {
            vehicleRepository.delete.mockResolvedValue({ affected: 0 });
            expect(vehiclesService.deleteVehicle(1, mockUser)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateVehicleStatus', () => {

        xit('updates vehicle status', async () => {
            const save = jest.fn().mockResolvedValue(true);

            vehiclesService.getVehicleById = jest.fn().mockResolvedValue({
                status: VehicleStatus.READY,
                save,
            });

            expect(vehiclesService.getVehicleById).not.toHaveBeenCalled();
            const result = await vehiclesService.updateVehicleStatus(1, VehicleStatus.PARKED);
            expect(vehiclesService.getVehicleById).toHaveBeenCalled();
            expect(save).toHaveBeenCalled();
            expect(result.status).toEqual(VehicleStatus.PARKED);
        });
    });
});
