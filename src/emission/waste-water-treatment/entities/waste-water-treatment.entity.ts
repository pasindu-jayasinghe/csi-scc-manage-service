import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { User } from "src/users/user.entity";
import { EmissionBaseEntity } from "src/emission/emission.base.entity";

@Entity()
export class WasteWaterTreatmentActivityData extends EmissionBaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    year: number;

    // @Column()
    // countryCode: string

    @Column({ type: "double",default: 0})
    wasteGenerated: number;

    @Column()
    wasteGenerated_unit: string;

    @Column({ type: "double",default: 0})
    tip:number;

    @Column()
    tip_unit: string;

    @Column({ type: "double",default: 0})
    cod: number;

    @Column()
    cod_unit: string;

    @Column()
    anaerobicDeepLagoon : string; //treatment method

    @Column({ type: "double",default: 0})
    sludgeRemoved : number;

    @Column()
    sludgeRemoved_unit : string;

    @Column({ type: "double",default: 0})
    recoveredCh4 : number;

    @Column()
    recoveredCh4_unit : string;

    @Column()
    month: number;

    @Column()
    emission: string;

    // @Column()
    // tco2e : number;

    // @Column()
    // tch4 : number;

    // @Column()
    // ef : number;

    // @Column()
    // tcod: number;

    

}
