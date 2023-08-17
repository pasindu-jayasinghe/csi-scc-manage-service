import { PartialType } from '@nestjs/mapped-types';
import { CreateFreightRoadDto } from './create-freight-road.dto';

export class UpdateFreightRoadDto extends PartialType(CreateFreightRoadDto) {}
