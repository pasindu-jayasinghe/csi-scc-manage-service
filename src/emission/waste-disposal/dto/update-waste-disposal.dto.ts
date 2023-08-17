import { PartialType } from '@nestjs/mapped-types';
import { CreateWasteDisposalDto } from './create-waste-disposal.dto';

export class UpdateWasteDisposalDto extends PartialType(CreateWasteDisposalDto) {}
