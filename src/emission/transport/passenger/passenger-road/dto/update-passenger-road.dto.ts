import { PartialType } from '@nestjs/swagger';
import { CreatePassengerRoadDto } from './create-passenger-road.dto';

export class UpdatePassengerRoadDto extends PartialType(CreatePassengerRoadDto) {}
