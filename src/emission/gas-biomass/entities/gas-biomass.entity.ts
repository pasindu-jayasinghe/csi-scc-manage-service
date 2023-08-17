import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity({name:'gas_biomass_activity_data'})
export class GasBiomassActivityData extends EmissionBaseEntity{
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    year: number;

    @Column()
    countryCode: string

    @Column()
    fcn: number;

    @Column()
    e_sc: number;

    @Column()
    type: string;


    
}
