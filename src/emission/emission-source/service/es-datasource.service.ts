import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EsDatasource } from '../entities/es-datasource.entity';

@Injectable()
export class EsDatasourceService extends TypeOrmCrudService<EsDatasource>{

  constructor(
    @InjectRepository(EsDatasource) repo
  ) {
    super(repo);
  }
  
}
