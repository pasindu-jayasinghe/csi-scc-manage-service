import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { Level } from './entities/level.entity';


@Injectable()
export class LevelService extends TypeOrmCrudService<Level> {

  constructor(
    @InjectRepository(Level)repo){
    super(repo);

  }


 
}
