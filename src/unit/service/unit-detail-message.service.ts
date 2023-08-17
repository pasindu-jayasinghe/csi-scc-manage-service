import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { UnitDetailMessage } from '../entities/unit-detail-message.entity';


@Injectable()
export class UnitDetailMessageService extends TypeOrmCrudService<UnitDetailMessage> {

  constructor(
    @InjectRepository(UnitDetailMessage)repo){
    super(repo);

  }


 
}