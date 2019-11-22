import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('verify-token')
@UseGuards(AuthGuard())
export class VerifyTokenController {

    private logger = new Logger('VerifyTokenController');

    @Get()
    verifyToken(): string {
        this.logger.log('verifyToken() => OK');
        return 'OK';
    }
}
