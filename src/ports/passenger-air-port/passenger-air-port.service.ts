import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { PassengerAirPort } from './passenger-air-port.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PassengerAirPortService extends TypeOrmCrudService<PassengerAirPort>{
    
    constructor(
        @InjectRepository(PassengerAirPort) repo
    ) {
        super(repo);
    }

    async getAirportByCode(code: string){
        return await this.repo.findOne({airport_code: code})
    }
}
