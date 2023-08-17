import { PartialType } from '@nestjs/swagger';
import { CreatePassengerAirDto } from './create-passenger-air.dto';

export class UpdatePassengerAirDto extends PartialType(CreatePassengerAirDto) {}
