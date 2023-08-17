import { PartialType } from '@nestjs/swagger';
import { CreatePassengerOffroadDto } from './create-passenger-offroad.dto';

export class UpdatePassengerOffroadDto extends PartialType(CreatePassengerOffroadDto) {}
