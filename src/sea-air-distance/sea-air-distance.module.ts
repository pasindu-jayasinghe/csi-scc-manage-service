
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmissionSource } from 'src/emission/emission-source/entities/emission-source.entity';
import { EmissionSourceModule } from 'src/emission/emission-source/emission-source.module';
import { AirPortsDis } from './entities/air-ports.entity';
import { AirPortDisController } from './controller/air-port.controller';
import { AirPortDisService } from './services/air-port.service';
import { SeaPortsDis } from './entities/sea-ports.entity';
import { SeaPortsDisController } from './controller/sea-ports.controller';
import { SeaPortDisService } from './services/sea-ports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
        AirPortsDis,
        SeaPortsDis
    ]),
    
  ],
  controllers: [AirPortDisController,SeaPortsDisController],
  providers: [AirPortDisService,SeaPortDisService],
  exports: [AirPortDisService,SeaPortDisService]
})
export class SeaAirDistanceModule {}
