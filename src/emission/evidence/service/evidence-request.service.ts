import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { EvidenceStatus } from "src/emission/enum/evidence-status.enum";
import { sourceName } from "src/emission/enum/sourcename.enum";
import { Project } from "src/project/entities/project.entity";
import { projectStatus } from "src/project/enum/project-status.enum";
import { getConnection, In, Not, Repository } from "typeorm";
import { EnableVerificationResDto, ResponseDto, UploadResDto } from "../dto/evidenceRequest.dto";
import { EvidenceDocument } from "../entities/evidence-document.entity";
import { EvidenceRequest } from "../entities/evidence-request.entity";
import { Documents } from 'src/document/entity/document.entity';

@Injectable()
export class EvidenceRequestService extends TypeOrmCrudService<EvidenceRequest> {
    constructor(
        @InjectRepository(EvidenceRequest) repo,
        @InjectRepository(EvidenceRequest)
        private readonly elecEvidenceRepository: Repository<EvidenceRequest>,
        @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
        @InjectRepository(EvidenceDocument) private readonly evDocRepo: Repository<EvidenceDocument>,
        @InjectRepository(Documents) private readonly documentRepo: Repository<Documents>
    ) {
        super(repo);
    }

    // async create(createEvidenceDto: EvidenceRequest) {
    //     console.log("service", createEvidenceDto)
    //     return await this.elecEvidenceRepository.save(createEvidenceDto);
    // }

    findAll() {
        return this.elecEvidenceRepository.find();
    }

    async update(id: number, updateEvidenceDto: EvidenceRequest) {

        return await this.repo.save( updateEvidenceDto);
        // if (updated.affected === 1) {
        //     return await this.repo.findOne(id);
        // } else {
        //     throw new InternalServerErrorException("Updating is failed");
        // }

    }

    remove(id: number) {
        return `This action removes a #${id} project`;
    }

    async requestEvidence(evidenceReq: EvidenceRequest, projectId: number, activtyDataId: number, code: string){
        let updatedreq = await this.repo.save(evidenceReq);
        if (updatedreq && evidenceReq.evidenceStatus !== EvidenceStatus.Returned){
            console.log("returned")
            let project = await this.projectRepo.findOne(projectId)
            if (project.projectStatus !== projectStatus.EvidencePending){
                project.projectStatus = projectStatus.EvidencePending
                this.projectRepo.update(projectId, project)
            }
            const queryRunner = getConnection().createQueryRunner()
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {

                let source = this.formatSourceName(code)
                await queryRunner.manager.getRepository(source.class)
                    .createQueryBuilder('acData')
                    .update(source.class)
                    .set({ activityDataStatus: ActivityDataStatus.EvidencePending })
                    .where("id = :id", { id: activtyDataId })
                    .execute()

                await queryRunner.commitTransaction()

            } catch (error) {
                queryRunner.rollbackTransaction()
                console.log(error);
                throw new InternalServerErrorException();
            } finally {
                queryRunner.release();
            }

        } else {
            // throw new InternalServerErrorException("Failed");
        }
        return updatedreq
    }

    async getRequestsForActivityData(parameterId: number, month: number, activityDataId: number, code: sourceName, status?: EvidenceStatus): Promise<ResponseDto> {
        // console.log("getRequestsForActivityData")
        let response = new ResponseDto()

        let filter = 'parameter.id = :parameterId AND month = :month AND activityDataId = :activityDataId AND esCode = :code'
        if (status) {
            console.log("status", status)
            filter = `${filter} AND evidenceStatus = :status`
        }

        let d: EvidenceRequest[]

        try {
            let data = this.repo.createQueryBuilder('evidence')
                .innerJoinAndSelect(
                    'evidence.parameter',
                    'parameter',
                    'parameter.id = evidence.parameterId'
                )
                .where(filter, { parameterId: parameterId, month: month, activityDataId: activityDataId, code: code, status: status })
                .cache(false)
    
            d = await data.getMany();
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException()
        }
        // console.log("res---", d)
        // console.log("parameters----", data.getParameters())
        // console.log("query and para---", data.getQueryAndParameters())

        response.requests = d;
        response.isRequested = response.requests.length > 0
        let approved = response.requests.filter(o => o.evidenceStatus === EvidenceStatus.Approved)
        response.isApproved = approved.length > 0
        let rejected = response.requests.filter(o => o.evidenceStatus === EvidenceStatus.Rejected)
        response.isRejected = rejected.length > 0
        let uploaded = response.requests.filter(o => o.evidenceStatus === EvidenceStatus.Uploaded)
        response.isUploaded = uploaded.length > 0
        let returned = response.requests.filter(o => o.evidenceStatus === EvidenceStatus.Returned)
        response.isReturned = returned.length > 0


        return response
    }

    async uploadEvidenceDocument(documentId: number, evidenceId: number, comment: string ):Promise<UploadResDto>{
   
        // update evidence request status
        // create evidence document
        let document = await this.documentRepo.findOne(documentId)
        if(!document){
            return {status: false, message: "Document not found"}
        }
        
        let evidence = await this.repo.findOne(evidenceId);

        if(!evidence){
            return {status: false, message: "Evidence not found"}
        }
        let previousState = evidence.evidenceStatus;


        try{
            let updated = await this.repo.update({id:evidenceId}, {evidenceStatus: EvidenceStatus.Uploaded});
            if (updated.affected === 1){
                let evidenceDoc = new EvidenceDocument();
                evidenceDoc.comment = comment;
                evidenceDoc.document = document;
                evidenceDoc.evidenceRequest = evidence;
    
                try{
                    let res = await this.evDocRepo.save(evidenceDoc)
                    if (res){
                        return { status: true, message: "Uploaded successfully" }
                    } else {
                        return {status: false, message: "Uploaded but record is not created"}
                    }
                }catch(err){
                    await this.repo.update({id:evidenceId}, {evidenceStatus: previousState})
                    console.log("err 1", err);
                    return {status: false, message: "Uploaded but record is not created"}
                }
            } else {
                return { status: false, message: "Update evidence failed" }
            }
        }catch(err){
            console.log("err 2", err);
            return {status: false, message: "Updating failes"}
        }

        
    }

    async enableVerification(esCodes: sourceName[], projectId?: number):Promise<EnableVerificationResDto> {
        const queryRunner = getConnection().createQueryRunner()
        await queryRunner.connect();
        // await queryRunner.startTransaction();

        if (esCodes.length > 0){
            let reqs = await this.repo.find({ esCode: In(esCodes), evidenceStatus: Not(In([EvidenceStatus.Approved, EvidenceStatus.Rejected]))})
    
            reqs = this.group(reqs, 'esCode')
            let keys = Object.keys(reqs)
    
            let exists = 0
    
            if (keys.length > 0) {
                for await(const key of keys){
                    let ids = reqs[key].map(m => {return m.activityDataId})
                    let source = this.formatSourceName(key)
                    try {
                        let data = queryRunner.manager.getRepository(source.class)
                            .createQueryBuilder('acData')
                            .innerJoin(
                                'acData.project',
                                'project',
                                'project.id = acData.projectId'
                            ).where('acData.id IN (:acIds) AND project.id = :projectId', { acIds: ids, projectId: projectId })
                        exists += await data.getCount()
                    } catch (error) {
                        console.log(error);
                        throw new InternalServerErrorException();
                    } finally {
                        queryRunner.release();
                    }
                    return {status: "success", isEnables: (exists < 0 || exists === 0), message: ""}
                }
            } else {
                return {status: "warning", isEnables: true, message: "No pending evidence requests found"}
            }
        } else {
            return {status: "warning", isEnables: false, message: "No emission source assigned"}
        }
    }

    formatSourceName(s: string) {
        let _class = (s.split("_").join(" ")
            .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())
            .replace(/\s/g, '')) + 'ActivityData'

        let _entity = s + '_activity_data'
        return {
            class: _class, entity: _entity
        }
    }

    group(list: any[], prop: string | number) {
        return list.reduce((groups, item) => ({
            ...groups,
            [item[prop]]: [...(groups[item[prop]] || []), item]
        }), {});
    }
}