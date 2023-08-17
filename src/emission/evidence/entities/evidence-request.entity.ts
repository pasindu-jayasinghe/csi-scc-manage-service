import { EvidenceStatus } from "src/emission/enum/evidence-status.enum";
import { sourceName } from "src/emission/enum/sourcename.enum";
import { Parameter } from "src/parameter/entities/parameter.entity";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class EvidenceRequest extends BaseTrackingEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    activityDataId: number;

    @Column()
    evidenceStatus: EvidenceStatus;

    @Column()
    comment: string;

    @Column()
    esCode: sourceName;

    @Column()
    month: number;

    @ManyToOne((type) => Parameter, { eager: true })
    @JoinColumn()
    parameter: Parameter;

    @ManyToOne((type) => User, { eager: false, nullable: true })
    @JoinColumn()
    requestFrom: User;

    @ManyToOne((type) => User, { eager: false, nullable: true })
    @JoinColumn()
    verifier: User;

    @ManyToOne((type) => Project, { eager: false, nullable: true })
    @JoinColumn()
    project: Project;

}
