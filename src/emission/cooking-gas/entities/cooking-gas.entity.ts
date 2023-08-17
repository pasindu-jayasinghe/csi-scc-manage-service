import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'cooking_gas_activity_data'})
export class CookingGasActivityData extends EmissionBaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    year: number;

    // @Column()
    // countryCode: string

    @Column({ type: "double",default: 0})
    fcn: number;

    @Column()
    fcn_unit: string;

    @Column()
    emission: string;

    @Column()
    emissionSource: string;    

    @Column({nullable: true})
    gasType: string;    

    @Column()
    month: number;

    

}
