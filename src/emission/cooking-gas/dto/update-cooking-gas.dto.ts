import { PartialType } from '@nestjs/mapped-types';
import { CreateCookingGasDto } from './create-cooking-gas.dto';

export class UpdateCookingGasDto extends PartialType(CreateCookingGasDto) {}
