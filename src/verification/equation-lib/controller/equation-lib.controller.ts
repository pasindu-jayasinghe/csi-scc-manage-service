import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EquationLibService } from '../service/equation-lib.service';

@UseGuards(JwtAuthGuard)
@Controller('equation-lib')
export class EquationLibController {

    constructor(
        private service: EquationLibService
    ){

    }

    @Get('get-equation')
    async getEquation(
        @Query('source') source: string
    ){
        return await this.service.generateEquation(source)
    }
}
