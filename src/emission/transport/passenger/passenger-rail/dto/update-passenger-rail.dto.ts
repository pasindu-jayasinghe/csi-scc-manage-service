import { PartialType } from '@nestjs/swagger';
import { CreatePassengerRailDto } from './create-passenger-rail.dto';

export class UpdatePassengerRailDto extends PartialType(CreatePassengerRailDto) {}
