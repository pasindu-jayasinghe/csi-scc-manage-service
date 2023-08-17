import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryService } from 'src/country/country.service';
import { Country } from 'src/country/entities/country.entity';
import { CalculationService } from 'src/emission/calculation/calculation.service';
import { EmissionSourceModule } from 'src/emission/emission-source/emission-source.module';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { AirPort } from 'src/ports/air-port-list.entity';
import { AirPortService } from 'src/ports/air-port-list.service';
import { ProjectModule } from 'src/project/project.module';
import { Unit } from 'src/unit/entities/unit.entity';
import { UnitModule } from 'src/unit/unit.module';
import { ParameterUnit } from 'src/utills/parameter-units';
import { FreightAirActivityDataController } from './controller/freight-air.controller';
import { FreightAirActivityData } from './entities/freight-air.entity';
import { FreightAirService } from './service/freight-air.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FreightAirActivityData,Country,AirPort, Unit]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [FreightAirActivityDataController],
  providers: [FreightAirService, CalculationService,ParameterUnit,CountryService,AirPortService, ProgresReportService],
  exports:[FreightAirService]
})
export class FreightAirModule {}
