import { Controller, Get, Logger } from '@nestjs/common';

@Controller('health-check')
export class HealthCheckController {

    private logger = new Logger('HealthCheckController');

    @Get()
    healthCheck(): string {
        this.logger.log('healthCheck() => OK');
        return 'OK';
    }
}
