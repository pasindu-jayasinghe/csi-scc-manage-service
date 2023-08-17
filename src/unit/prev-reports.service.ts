import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { PrevReport } from './entities/prev-report.entity';

@Injectable()
export class PrevReportsService extends TypeOrmCrudService<PrevReport>{
  constructor(
    @InjectRepository(PrevReport)repo, 

  ) {
    super(repo);

  }
}
