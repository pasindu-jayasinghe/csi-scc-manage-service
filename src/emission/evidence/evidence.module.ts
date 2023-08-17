import { Module } from '@nestjs/common';
import { EvidenceRequestService } from './service/evidence-request.service';
import { EvidenceRequestController } from './controller/evidence-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvidenceRequest } from './entities/evidence-request.entity';
import { EvidenceDocument } from './entities/evidence-document.entity';
import { EvidenceDocumentController } from './controller/evidence-document.controller';
import { EvidenceDocumentService } from './service/evidence-document.service';
import { ProjectModule } from 'src/project/project.module';
import { Project } from 'src/project/entities/project.entity';
import { DocumentModule } from 'src/document/document.module';
import { Documents } from 'src/document/entity/document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EvidenceRequest,
      EvidenceDocument,
      Project,
      Documents
    ]),
    ProjectModule,
    DocumentModule
  ],
  controllers: [EvidenceRequestController, EvidenceDocumentController],
  providers: [EvidenceRequestService, EvidenceDocumentService]
})
export class EvidenceModule {}
