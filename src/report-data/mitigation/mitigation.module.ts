import { Module } from '@nestjs/common';
import { MitigationService } from './service/mitigation.service';
import { MitigationController } from './controller/mitigation.controller'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mitigation } from './entities/mitigation.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Mitigation
    ]), 
    HttpModule,
  ],
  controllers: [MitigationController],
  providers: [MitigationService]
})
export class MitigationModule {}
