import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class WasteDisposalActivityData extends EmissionBaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    year: number;

    // @Column()
    // countryCode: string

    @Column()
    disposalMethod: string;

    @Column()
    wasteType: string;

    @Column({ type: "double"})
    amountDisposed: number;

    @Column()
    amountDisposed_unit: string; //consumption_unit

    @Column({ type: "double",default: 0})
    emission: number;

    @Column()
    month: number;

    

}
