import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ReportHistory } from '../entities/reportHistory.entity';

@Injectable()
export class ReportHistoryService extends TypeOrmCrudService<ReportHistory>{

  constructor( @InjectRepository(ReportHistory)repo){
    super(repo);
  }
}
