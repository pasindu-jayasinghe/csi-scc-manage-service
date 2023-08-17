import { PartialType } from '@nestjs/swagger';
import { CreateBusinessTravelDto } from './create-business-travel.dto';

export class UpdateBusinessTravelDto extends PartialType(CreateBusinessTravelDto) {}
