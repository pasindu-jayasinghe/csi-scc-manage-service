import { PartialType } from '@nestjs/swagger';
import { CreateOffroadMachineryOffroadDto } from './create-offroad-machinery-offroad.dto';

export class UpdateOffroadMachineryOffroadDto extends PartialType(CreateOffroadMachineryOffroadDto) {}
