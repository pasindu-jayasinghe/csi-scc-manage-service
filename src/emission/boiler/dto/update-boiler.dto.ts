import { PartialType } from '@nestjs/mapped-types';
import { CreateBoilerDto } from './create-boiler.dto';

export class UpdateBoilerDto extends PartialType(CreateBoilerDto) {}
