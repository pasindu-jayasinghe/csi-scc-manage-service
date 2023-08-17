import { PartialType } from '@nestjs/swagger';
import { CreateTNDLossDto } from './create-t-n-d-loss.dto';

export class UpdateTNDLossDto extends PartialType(CreateTNDLossDto) {}
