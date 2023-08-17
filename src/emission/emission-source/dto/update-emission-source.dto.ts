import { PartialType } from '@nestjs/swagger';
import { CreateEmissionSourceDto } from './create-emission-source.dto';

export class UpdateEmissionSourceDto extends PartialType(CreateEmissionSourceDto) {}
