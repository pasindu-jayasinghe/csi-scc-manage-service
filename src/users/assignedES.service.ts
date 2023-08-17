import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { AssignedES } from './assignedES.entity';

@Injectable()
export class AssignedESService extends TypeOrmCrudService<AssignedES> {
  constructor(
    @InjectRepository(AssignedES) repo,
    @InjectRepository(AssignedES)
    private readonly assignedESRepository: Repository<AssignedES>,

  ) {
    super(repo);
  }

}
