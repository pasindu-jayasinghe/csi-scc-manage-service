import { PartialType } from '@nestjs/mapped-types';
import { CreateFreightAirDto } from './create-freight-air.dto';

export class UpdateFreightAirDto extends PartialType(CreateFreightAirDto) {}
