import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EsExcludeReason } from '../entities/es-exclude-reason.entity';

@Injectable()
export class EsExcludeReasonService extends TypeOrmCrudService<EsExcludeReason>{

  constructor(
    @InjectRepository(EsExcludeReason) repo
  ) {
    super(repo);
  }
  
}
