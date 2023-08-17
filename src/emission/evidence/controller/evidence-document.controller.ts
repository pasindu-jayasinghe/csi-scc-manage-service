import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Crud, CrudController } from "@nestjsx/crud";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Repository } from "typeorm";
import { EvidenceDocument } from "../entities/evidence-document.entity";
import { EvidenceDocumentService } from "../service/evidence-document.service";

@Crud({
  model: {
    type: EvidenceDocument,
  },
  query: {
    join: {
      evidenceRequest: {
        eager: true,
      },
      document: {
        eager: true
      }
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('evidence-document')
export class EvidenceDocumentController implements CrudController<EvidenceDocument>{
    constructor(
        public service: EvidenceDocumentService,
        @InjectRepository(EvidenceDocument)
        private readonly evidenceRepository: Repository<EvidenceDocument>,
      ) {}
    
      get base(): CrudController<EvidenceDocument> {
        return this;
      }
    
      // @Post()
      // create(@Body() createProjectDto: EvidenceDocument): Promise<EvidenceDocument> {
      //   console.log(createProjectDto)
      //   return this.service.create(createProjectDto);
      // }
    
    //   @Get(':id')
    //   findOne(@Param('id') id: string): Promise<EvidenceDocument> {
    //     return this.service.findOne(+id);
    //   }
    
    //   @Patch(':id')
    //   update(@Param('id') id: string, @Body() updateProjectDto: EvidenceDocument) {
    //     return this.service.update(+id, updateProjectDto);
    //   }
}