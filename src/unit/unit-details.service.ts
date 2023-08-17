import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { UnitDetails } from './entities/unit-details.entity';


@Injectable()
export class UnitDetailsService extends TypeOrmCrudService<UnitDetails> {

  constructor(
    @InjectRepository(UnitDetails)repo){
    super(repo);

  }



  async filePathSave(name:string,id:number){

    let existingUnit = await this.repo.findOne({
      where: { id: id}, });
    // existingUnit.logopath = "/public/"+name;
    existingUnit.logopath = "/"+name;


    return await this.repo.save(existingUnit)



  }

async getUnitEmployees(unitIds: number[], year: number):Promise<any>{

    try{
      let filterComparisonGraph = `graph.baseYear =  :year and unit.id IN (:unitIds) `
      let data = this.repo.createQueryBuilder('graph')

      .innerJoin(
        'graph.unit',
        'unit',
        'unit.id = graph.unitId'
      )
      
        .select(["unit.id","graph.employees","graph.baseYear"])
         .where(filterComparisonGraph, {year, unitIds })

        //console.log(data.getQuery())   
        return data.execute();
    }catch(errr){
      console.error(errr)
      throw new InternalServerErrorException(errr);
    }
  }
 


  async getUnitEmployeesCount(unitIds: number[], year: number):Promise<any>{
    try{
      let filterComparisonGraph = `graph.baseYear =  :year and unit.id IN (:unitIds) `
      let data = this.repo.createQueryBuilder('unitDetail')
        .innerJoin(
          'graph.unit',
          'unit',
          'unit.id = graph.unitId'
        )
        .select(["unit.id","unitDetail.employees","unitDetail.baseYear"])
        .where(filterComparisonGraph, {year, unitIds })
        return data.getCount();
    }catch(errr){
      console.error(errr)
      throw new InternalServerErrorException(errr);
    }
  }

}
