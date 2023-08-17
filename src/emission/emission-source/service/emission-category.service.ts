import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EmissionCategory } from '../entities/emission-category.entity';

@Injectable()
export class EmissionCategoryService extends TypeOrmCrudService<EmissionCategory>{
  constructor(
    @InjectRepository(EmissionCategory) repo
  ) {
    super(repo);
  }
}
