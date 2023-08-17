import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Uncertainty } from '../entities/uncertainty.entity';

@Injectable()
export class UncertaintyService extends TypeOrmCrudService<Uncertainty>{

  constructor( @InjectRepository(Uncertainty)repo){
    super(repo);
  }
}
