import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectModule } from 'src/project/project.module';
import { Unit } from 'src/unit/entities/unit.entity';
import { UnitModule } from 'src/unit/unit.module';
import { ParameterUnit } from 'src/utills/parameter-units';
import { CalculationService } from '../calculation/calculation.service';
import { EmissionSourceModule } from '../emission-source/emission-source.module';
import { TNDLossActivityDataController } from './controller/t-n-d-loss.controller'
import { TNDLossActivityData } from './entities/t-n-d-loss.entity';
import { TNDLossService } from './service/t-n-d-loss.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TNDLossActivityData,
      Unit
    ]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [TNDLossActivityDataController],
  providers: [TNDLossService, ParameterUnit, CalculationService],
  exports: [TNDLossService]
})
export class TNDLossModule {}
