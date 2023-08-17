import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Repository } from "typeorm";
import { EvidenceDocument } from "../entities/evidence-document.entity";

@Injectable()
export class EvidenceDocumentService extends TypeOrmCrudService<EvidenceDocument> {
    constructor(
        @InjectRepository(EvidenceDocument) repo,
        @InjectRepository(EvidenceDocument)
        private readonly elecEvidenceRepository: Repository<EvidenceDocument>,
    ) {
        super(repo);
    }

    // async create(createEvidenceDto: EvidenceDocument) {
    //     console.log("service", createEvidenceDto)
    //     return await this.elecEvidenceRepository.save(createEvidenceDto);
    // }

    // findAll() {
    //     return this.elecEvidenceRepository.find();
    // }

    // async update(id: number, updateEvidenceDto: EvidenceDocument) {

    //     const updated = await this.repo.update({
    //         id: id
    //     }, updateEvidenceDto);
    //     if (updated.affected === 1) {
    //         return await this.repo.findOne(id);
    //     } else {
    //         throw new InternalServerErrorException("Updating is failed");
    //     }

    // }

    remove(id: number) {
        return `This action removes a #${id} project`;
    }
}