import { PartialType } from '@nestjs/mapped-types';
import { CreateFreightOffroadDto } from './create-freight-offroad.dto';

export class UpdateFreightOffroadDto extends PartialType(CreateFreightOffroadDto) {}
