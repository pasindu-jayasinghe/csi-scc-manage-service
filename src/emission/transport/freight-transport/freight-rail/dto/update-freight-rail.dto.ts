import { PartialType } from '@nestjs/mapped-types';
import { CreateFreightRailDto } from './create-freight-rail.dto';

export class UpdateFreightRailDto extends PartialType(CreateFreightRailDto) {}
