import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class InvestmentsActivityData extends EmissionBaseEntity{
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    month: number;

    @Column()
    year: number;

    
    @Column({nullable:true})
    activityType: string;

    @Column({type: "double",default: 0,nullable:true})
    scp1scpe2EmissionsOfEquityInvestment:number;

    @Column({type: "double",default: 0,nullable:true})
    shareOfEquity:number;

    @Column({type: "double",default: 0,nullable:true})
    investeeCompanyTotalRevenue:number;

    @Column({type: "double",default: 0,nullable:true})
    ef_InvesteeSector:number;

    @Column({type: "double",default: 0,nullable:true})
    shareOfTotalProjectCosts:number

    @Column({type: "double",default: 0,nullable:true})
    scp1scp2EmissionRelevantProject:number


    @Column({type: "double",default: 0,nullable:true})
    projectConstructionCost:number

    @Column({type: "double",default: 0,nullable:true})
    ef_ReleventConsSector:number

    @Column({type: "double",default: 0,nullable:true})
    projectRevenueInReportingYear:number


    @Column({type: "double",default: 0,nullable:true})
    ef_relevantOperatingSector:number

    @Column({type: "double",default: 0,nullable:true})
    projectedAnnualEmissionsOfProject:number

    @Column({type: "double",default: 0,nullable:true})
    projectedLifetimeOfProject:number


    @Column({type: "double",default: 0})
    emission: number;

    @Column({nullable:true,default: 0})
    groupNo: string


    @Column({nullable:true})
    scp1scpe2EmissionsOfEquityInvestment_unit:string;

    
    @Column({nullable:true})
    scp1scp2EmissionRelevantProject_unit:string

    @Column({nullable:true})
    projectedAnnualEmissionsOfProject_unit:string


    @Column({nullable:true})
    investeeSector:String;

    @Column({nullable:true})
    constructSector:string

    @Column({nullable:true})
    operatingtSector:string

    
}
