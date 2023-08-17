import { PartialType } from '@nestjs/mapped-types';
import { CreateFreightWaterDto } from './create-freight-water.dto';

export class UpdateFreightWaterDto extends PartialType(CreateFreightWaterDto) {}
