import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { PrevEmission } from '../entities/prev-emission.entity';


@Injectable()
export class PrevEmissionService extends TypeOrmCrudService<PrevEmission> {

  constructor(
    @InjectRepository(PrevEmission)repo){
    super(repo);

  }


 
}
