import { PartialType } from '@nestjs/swagger';
import { CreateFireExtinguisherDto } from './create-fire-extinguisher.dto';

export class UpdateFireExtinguisherDto extends PartialType(CreateFireExtinguisherDto) {}
