import { PartialType } from '@nestjs/swagger';
import { CreateEvidenceRequestDto } from './create-evidence-request.dto';

export class UpdateEvidenceRequestDto extends PartialType(CreateEvidenceRequestDto) {}
