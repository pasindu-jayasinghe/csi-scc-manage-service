import { Project } from "src/project/entities/project.entity";
import { Unit } from "src/unit/entities/unit.entity";
import { User } from "src/users/user.entity";

export class InvestmentsActivityDataDto {

 
    month: number;
    year: number;
    activityType: string;


    mobile: boolean;

    stationary: boolean;
  
    user: User;
  
    unit: Unit;
  
    project: Project;
  
    ownership: string;
  
    direct: boolean;
  
    indirect: boolean;
  
    other: boolean;

    groupNo:string
    methodA_data:methodABasedData[];
    methodB_data:methodBBasedData[];
    methodC_data:methodCBasedData[];
    methodD_data:methodDBasedData[];
    methodE_data:methodEBasedData[];




}


export class methodABasedData {
    
    id:number
    scp1scpe2EmissionsOfEquityInvestment: number | null;
    shareOfEquity:number | null;
    scp1scpe2EmissionsOfEquityInvestment_unit:string
  }


  export class methodBBasedData {
    id:number
    investeeCompanyTotalRevenue: number | null;
    ef_InvesteeSector:number| null;
    shareOfEquity:number| null;
    investeeSector:String;
  }

  export class methodCBasedData {
    id:number
    scp1scp2EmissionRelevantProject: number| null;
    shareOfTotalProjectCosts:number| null;
    scp1scp2EmissionRelevantProject_unit:string

  }

  export class methodDBasedData {
    id:number
    projectConstructionCost:number| null;
    ef_ReleventConsSector:number| null;
    shareOfTotalProjectCosts:number| null;
    projectRevenueInReportingYear:number| null;
    ef_relevantOperatingSector:number| null;
    constructSector:string
    operatingtSector:string


  }


  export class methodEBasedData {
    id:number
    projectedAnnualEmissionsOfProject:number| null;
    projectedLifetimeOfProject:number| null;
    shareOfTotalProjectCosts:number| null;
    projectedAnnualEmissionsOfProject_unit:string
   

  }





export enum ActivityType {
    methodA = 'investment-specific-method-equity-investments',
    methodB = 'average-data-method-equity-investments',
    methodC = 'project-specific-method-project-finance-and-debt-investments',
    methodD = 'average-data-method-project-finance-and-debt-investments',
    methodE = 'projected-total-lifetime-emissions-project-finance-and-debt-investments',
  }