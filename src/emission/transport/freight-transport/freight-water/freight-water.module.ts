import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryService } from 'src/country/country.service';
import { Country } from 'src/country/entities/country.entity';
import { CalculationService } from 'src/emission/calculation/calculation.service';
import { EmissionSourceModule } from 'src/emission/emission-source/emission-source.module';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { SeaPort } from 'src/ports/sea-port-list.entity';
import { SeaPortService } from 'src/ports/sea-ports-list.service';
import { ProjectModule } from 'src/project/project.module';
import { Unit } from 'src/unit/entities/unit.entity';
import { UnitModule } from 'src/unit/unit.module';
import { ParameterUnit } from 'src/utills/parameter-units';
import { FreightWaterActivityDataController } from './controller/freight-water.controller';
import { FreightWaterActivityData } from './entities/freight-water.entity';
import { FreightWaterService } from './service/freight-water.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FreightWaterActivityData,Country,SeaPort, Unit]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [FreightWaterActivityDataController],
  providers: [FreightWaterService, CalculationService,ParameterUnit,CountryService,SeaPortService, ProgresReportService],
  exports:[FreightWaterService]
})
export class FreightWaterModule {}
