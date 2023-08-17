import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CalculationService } from '../calculation/calculation.service';
import { ProjectModule } from 'src/project/project.module';
import { EmissionSourceModule } from '../emission-source/emission-source.module';
import { ParameterUnit } from 'src/utills/parameter-units';
import { TNDLossModule } from '../t-n-d-loss/t-n-d-loss.module';
import { EmissionSource } from '../emission-source/entities/emission-source.entity';
import { Project } from 'src/project/entities/project.entity';
import { ProjectUnitEmissionSource } from 'src/project/entities/project-unit-emission-source.entity';
import { EmissionBaseService } from '../emission-base.service';
import { UnitModule } from 'src/unit/unit.module';
import { Unit } from 'src/unit/entities/unit.entity';
import { NetZeroBusinessTravelActivityDataController } from './controller/net-zero-business-travel.controller';
import { NetZeroBusinessTravelActivityData } from './entities/net-zero-business-travel.entity';
import { NetZeroBusinessTravelService } from './service/net-zero-business-travel.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NetZeroBusinessTravelActivityData,
      EmissionSource,
      ProjectUnitEmissionSource,
      Unit
    ]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    TNDLossModule,
    UnitModule
  ],
  controllers: [NetZeroBusinessTravelActivityDataController],
  providers: [NetZeroBusinessTravelService, CalculationService,ParameterUnit],
  exports:[NetZeroBusinessTravelService]
})
export class NetZeroBusinessTravelModule {}
