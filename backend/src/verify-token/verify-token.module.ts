import { Module } from '@nestjs/common';
import { VerifyTokenController } from './verifiy-token.controller';

@Module({
    imports: [
        VerifyTokenController,
    ],
    controllers: [ VerifyTokenController ],
    providers: [ VerifyTokenController ],
})
export class VerifyTokenModule {
}
