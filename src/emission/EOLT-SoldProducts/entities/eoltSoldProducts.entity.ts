import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class EndOfLifeTreatmentOfSoldProductsActivityData extends EmissionBaseEntity{
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    month: number;

    @Column()
    year: number;

    
    @Column({nullable:true})
    wasteMethod: string;

    @Column({type: "double",default: 0,nullable:true})
    soldProducts:number;

    @Column({type: "double",default: 0,nullable:true})
    totalWaste:number;

 
    @Column({type: "double",default: 0})
    emission: number;

    @Column({nullable:true,default: 0})
    groupNo: string

    @Column({nullable:true})
    mass_unit:string



    
}
