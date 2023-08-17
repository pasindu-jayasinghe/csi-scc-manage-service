import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Crud, CrudController } from "@nestjsx/crud";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { sourceName } from "src/emission/enum/sourcename.enum";
import { Repository } from "typeorm";
import { EnableVerificationReqDto, EnableVerificationResDto, EvidenceRequestDto, GetRequestsDto, ResponseDto, UploadDto, UploadResDto } from "../dto/evidenceRequest.dto";
import { EvidenceRequest } from "../entities/evidence-request.entity";
import { EvidenceRequestService } from "../service/evidence-request.service";



@Crud({
  model: {
    type: EvidenceRequest,
  },
  query: {
    join: {
      parameter: {
        eager: true,
      },
      requestFrom: {
        eager: true,
      },
      verifier: {
        eager: true,
      },
      project: {
        eager: true,
      }
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('evidence-request')
export class EvidenceRequestController implements CrudController<EvidenceRequest>{
  constructor(
    public service: EvidenceRequestService,
    @InjectRepository(EvidenceRequest)
    private readonly evidenceRepository: Repository<EvidenceRequest>,
  ) { }

  get base(): CrudController<EvidenceRequest> {
    return this;
  }

  // @Post()
  // create(@Body() createProjectDto: EvidenceRequest): Promise<EvidenceRequest> {
  //   console.log(createProjectDto)
  //   return this.service.create(createProjectDto);
  // }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<EvidenceRequest> {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: EvidenceRequest) {
    return this.service.update(+id, updateProjectDto);
  }

  @Post('request-evidence')
  async requestEvidence(
    @Body() req: EvidenceRequestDto
  ){
    return await this.service.requestEvidence(req.req, req.projectId, req.activityDataId, req.code)
  }

  @Post('get-requests-for-activity-data')
  async getRequestsForActivityData(
    @Body() req: GetRequestsDto
  ): Promise<ResponseDto>{
  //   console.log("get requests",{
  //     parameter: req.parameterId,
  //     month: req.month,
  //     activityDataId: req.activityDataId,
  //     esCode: req.esCode
  // })
  console.log(req)
    return await this.service.getRequestsForActivityData(req.parameterId, req.month, req.activityDataId, req.esCode)
  }

  @Post('upload-evidence')
  async uploadEvidenceDocument(
    @Body() req: UploadDto
  ):Promise<UploadResDto>{
    // console.log(req)
    return await this.service.uploadEvidenceDocument(req.documentId, req.evidenceId, req.comment)
  }

  @Post('enable-verification')
  async enableVerification(@Body() req: EnableVerificationReqDto):Promise<EnableVerificationResDto>{
    return await this.service.enableVerification(req.esCodes, req.projectId)
  }

}