
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeaPort } from './sea-port-list.entity';
import { AirPort } from './air-port-list.entity';
import { AirPortController } from './air-port-list.controller';
import { AirPortDisService } from 'src/sea-air-distance/services/air-port.service';
import { AirPortService } from './air-port-list.service';
import { SeaPortController } from './sea-port-list.controller';
import { SeaPortService } from './sea-ports-list.service';
import { RailPortController } from './rail-station.controller';
import { RailPortService } from './rail-station.service';
import { RailPort } from './rail-station.entity';
import { PassengerAirPortController } from './passenger-air-port/passenger-air-port.controller';
import { PassengerAirPortService } from './passenger-air-port/passenger-air-port.service';
import { PassengerAirPort } from './passenger-air-port/passenger-air-port.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
        AirPort,
        SeaPort,
        RailPort,
        PassengerAirPort
    ]),
    
  ],
  controllers: [AirPortController,SeaPortController,RailPortController, PassengerAirPortController],
  providers: [AirPortService,SeaPortService,RailPortService, PassengerAirPortService],
  exports: [AirPortService,SeaPortService,RailPortService]
})
export class PortsModule {}
