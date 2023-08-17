import { PartialType } from '@nestjs/swagger';
import { CreateElectricityDto } from './create-electricity.dto';

export class UpdateElectricityDto extends PartialType(CreateElectricityDto) {}
