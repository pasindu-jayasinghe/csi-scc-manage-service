import { Project } from "src/project/entities/project.entity";
import { Unit } from "src/unit/entities/unit.entity";
import { User } from "src/users/user.entity";

export abstract class ExcellUploadable{

  abstract getDto (): any;
  abstract create (dto: any);
  /**
   * For Data Migration
   * 
   * @param unit 
   * @param project 
   * @param user 
   * @param data 
   * @param variable_mapping 
   * @param year 
   */
  abstract addFromExcell(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[],year: number);

  /**
   * For excell upload from front-end
   * 
   * @param unit 
   * @param project 
   * @param user 
   * @param data 
   * @param variable_mapping 
   * @param year 
   * @param ownership 
   * @param isMobile 
   */
  abstract excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[],year: number, ownership: string, isMobile: boolean);

  /**
   * For getting required variables to create excell template
   */
  abstract downlodExcellBulkUploadVariableMapping();
}