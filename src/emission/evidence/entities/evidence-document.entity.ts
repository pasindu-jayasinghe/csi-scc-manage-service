import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import {  Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EvidenceRequest } from "./evidence-request.entity";
import { Documents } from "src/document/entity/document.entity";

@Entity()
export class EvidenceDocument  extends BaseTrackingEntity{


    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne((type) => EvidenceRequest, { eager: true })
    @JoinColumn()
    evidenceRequest: EvidenceRequest;

    @ManyToOne((type) => Documents, { eager: true })
    @JoinColumn()
    document: Documents;

    @Column()
    comment: string;

    
}
