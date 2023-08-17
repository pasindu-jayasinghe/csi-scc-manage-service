import { Module } from '@nestjs/common';
import { MunicipalWaterService } from './service/municipal-water.service';
import { MunicipalWaterActivityDataController } from './controller/municipal-water.controller';
import { MunicipalWaterActivityData } from './entities/municipal-water.entity';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculationService } from '../calculation/calculation.service';
import { ProjectModule } from 'src/project/project.module';
import { EmissionSourceModule } from '../emission-source/emission-source.module';
import { ParameterUnit } from 'src/utills/parameter-units';
import { Unit } from 'src/unit/entities/unit.entity';
import { UnitModule } from 'src/unit/unit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MunicipalWaterActivityData, Unit]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [MunicipalWaterActivityDataController],
  providers: [MunicipalWaterService, CalculationService,ParameterUnit],
  exports:[MunicipalWaterService]
})
export class MunicipalWaterModule {}
