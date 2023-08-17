// import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
// import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { User } from "src/users/user.entity";
import { EmissionBaseEntity } from "src/emission/emission.base.entity";


@Entity()
export class WeldingEsActivityData extends EmissionBaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    year: number;

    // @Column()
    // countryCode: string

    @Column({ type: "double",default: 0,nullable: true})
    ac : number;

    @Column({nullable: true})
    ac_unit : string;

    @Column({ type: "double",default: 0,nullable: true})
    lc: number;

    @Column({nullable: true})
    lc_unit: string;

    @Column()
    month: number;

    @Column()
    emission: string;

    @Column({ type: "double",default: 0,nullable: true})
    acetylene: number;

    @Column({ type: "double",default: 0,nullable: true})
    liquidCo2: number;

    


}
