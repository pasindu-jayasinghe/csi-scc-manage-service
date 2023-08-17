import { Module } from '@nestjs/common';
import { RecomendationService } from './recomendation/service/recomendation.service';
import { MitigationService } from './mitigation/service/mitigation.service';
import { NextStepsService } from './next-steps/service/next-steps.service';
import { RecomendationController } from './recomendation/controller/recomendation.controller';
import { MitigationController } from './mitigation/controller/mitigation.controller';
import { NextStepsController } from './next-steps/controller/next-steps.controller';
import { Mitigation } from './mitigation/entities/mitigation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recomendation } from './recomendation/entities/recomendation.entity';
import { NextStep } from './next-steps/entities/next-step.entity';
import { HttpModule } from '@nestjs/axios';
import { MitigationModule } from './mitigation/mitigation.module';
import { NextStepsModule } from './next-steps/next-steps.module';
import { RecomendationModule } from './recomendation/recomendation.module';


@Module({
  imports: [TypeOrmModule.forFeature([
    Mitigation, 
    Recomendation, 
    NextStep
  ]),
    HttpModule, 
    MitigationModule,
    NextStepsModule,
    RecomendationModule
],

})
export class ReportDataModule {}
