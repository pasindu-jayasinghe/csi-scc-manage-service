import { Injectable, InternalServerErrorException, OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from './entities/unit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, In, IsNull, Not, Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { CountryService } from 'src/country/country.service';
import { IndustryService } from './industry.service';
import { UnitStatus } from './enum/unit-status.enum';
import { RecordStatus } from 'src/shared/entities/base.tracking.entity';
import { UnitDetailsService } from './unit-details.service';
import { ProjectUnit } from 'src/project/entities/project-unit.entity';
import { PrevReportsService } from './prev-reports.service';
import { ConsecutiveYears } from './dto/consecutive-year.dto';
import { ParentChildCountDto } from './dto/dashboard.dto';
import { UnitDetails } from './entities/unit-details.entity';


@Injectable()
export class UnitService extends TypeOrmCrudService<Unit> implements OnApplicationBootstrap {

  constructor(
    @InjectRepository(Unit)repo, 
    private countryService: CountryService,
    private industryService: IndustryService,
    private unitDetailsService: UnitDetailsService,
    private prevReportsService: PrevReportsService
  ) {
    super(repo);

  }
  
  async onApplicationBootstrap() {
    const mas = await this.repo.find({name: "ClimateSI Unit"});
    
    if(mas.length === 0){
      let maUnit = new Unit();     
      maUnit.name = "ClimateSI Unit";
      maUnit.levelName = "Supper Unit";      
      maUnit.levelDetailsId = -1;
      await this.create(maUnit);
    }
  }

  async create(createUnitDto: Unit) {
    return await this.repo.save(createUnitDto);
  }

  update(id: number, updateUnitDto: UpdateUnitDto) {
    return `This action updates a #${id} unit`;
  }

  remove(id: number) {
    return `This action removes a #${id} unit`;
  }


  async addFromExcel(buffer: Buffer){

    //TODO: check duplicates for NO column


    const workbook = XLSX.read(buffer);
    let sheet = workbook.Sheets['add multiple units']
    let data = XLSX.utils.sheet_to_json(sheet);
    let parentUnits = data.filter(d => d['Parent Unit No'] === undefined)

    let alreadyList =await Promise.all(parentUnits.map(async pu=> this.repo.find({name: pu["Name"], status: RecordStatus.Active})))
    alreadyList = alreadyList.filter(a =>a.length > 0);
    if(alreadyList.length > 0){
      return {
        status: false,
        message:  "You ahve entered already endered parent units, Please deleted them and upload again"
      }
    }else{
      await Promise.all(parentUnits.map(async pu => {
        await this.insterUnit(pu, data);
      }))
      return {
        status: true,
        message: "Success"
      }
    }
  }

  async insterUnit(row: any, all: any[], parentUnit: Unit | null = null){
    
    let no = row['No'];
    let countryCode = row['Country Code'];
    let country = await this.countryService.findbyCountryCode(countryCode);
    let industry = await this.industryService.findbyCode(row['Industry code'])
    let data = {
      name: row['Name'],
      levelName: row['Level Name']?row['Level Name']: "-",
      country: country,
      parentUnit: parentUnit,
      levelDetailsId: -1,
      industry: industry
    }
    let savedUnit = await this.repo.save(data)

    let clidUnits = all.filter(u => u['Parent Unit No']=== no)
    await Promise.all(clidUnits.map(async cu => await this.insterUnit(cu, all, savedUnit)))
  }

  async getOneById(id: number){
    let unit = await this.repo.findOne(id);
    return unit;
  }

  async chnageStatus(unitId: number, status: UnitStatus, all: boolean = false): Promise<Unit> {
    try{
      if(all){
        let units = await this.getChildUnits(unitId);
        let ids = units.map(u => u.id);
        let updated  = this.repo.update({id: In([...ids,unitId])}, {unitStatus: status});
        let unit = await this.repo.findOne(unitId);
        return unit;
      }else{
        let updated  = this.repo.update(unitId, {unitStatus: status});
        let unit = await this.repo.findOne(unitId);
        return unit;
      }
    }catch(err){
      throw new InternalServerErrorException(err);
    }
  }

  async getConsecutiveYears(unitId: number, projectTypeId: number): Promise<ConsecutiveYears>{
    let unitDetaisl = await this.unitDetailsService.find({unit: {id: unitId}});
    let prevReports = [];
    let years: any[] = [];
    if(unitDetaisl && unitDetaisl.length > 0){
      prevReports = await this.prevReportsService.find({unitDetail: {id: unitDetaisl[0].id}});
      prevReports.forEach(pr => {
        years.push({
          year: pr.year,
          withCSI: false
        })
      })
    }

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    // await queryRunner.startTransaction();
    let puQ = queryRunner.manager.getRepository(ProjectUnit)
    
      .createQueryBuilder('pu')
      .leftJoinAndSelect(
        'pu.unit',
        'unit',
        'unit.id = pu.unit'
      )
      .leftJoinAndSelect(
        'pu.project',
        'project',
        'project.id = pu.project'
      )
      .leftJoinAndSelect(
        'project.projectType',
        'projectType',
        'projectType.id = project.projectType'
      )
      .select(["project.year",])
      .where('project.projectStatus <> :projectStatus AND unit.id =:unitId AND projectType.id = :projectType', { 
        projectStatus: 'Initial', 
        unitId: unitId,
        projectType: projectTypeId
      })
      .groupBy("project.year")

      try{
        const puList = await puQ.execute();
        puList.forEach(pr => {
          years.push({
            year: pr.project_year,
            withCSI: true
          })
        })
  
      
        let res = new ConsecutiveYears();
        res.years = years;
        res.unitDetaisl = prevReports;
        res.puList = puList;
        
        return res;
      }catch(err){
        console.log("err --- ", err);
        return null;
      }finally{
        queryRunner.release()
      }
     
  }

  async getUnitsWithParent(unitIds: number[]){
    const queryRunner = getConnection().createQueryRunner();
    try{
      await queryRunner.connect();
      // await queryRunner.startTransaction();
      let res = await queryRunner.manager.getRepository(Unit)
        .createQueryBuilder('u')
        .leftJoinAndSelect(
          'u.parentUnit',
          'unit',
          'unit.id = u.parentUnitId'
        )
        // .leftJoinAndSelect(
        //   'pu.project',
        //   'project',
        //   'project.id = pu.project'
        // )        
        .where('unit.id IN (:...unitIds)', { unitIds })
        .getMany();

      return res;
    }catch(err){
      console.log(err);
      throw new InternalServerErrorException(err);
    }finally{
      queryRunner.release();
    }
  }




  async getChildUnits(unitId: number) {
    let res
    let childs = [unitId]
    let newChilds: Unit[] = []
    let allChilds = []
    do {
      newChilds = []
      for await (const child of childs){
        res = await this.repo.find({parentUnit: {id: child}})
        newChilds.push(...res)
      }
      allChilds.push(...newChilds)
      childs = newChilds.map(o => {return o.id})
    } while (childs.length > 0);
    return allChilds
  }

  async getParentChildUnits(unitId?: number){
    let count = new ParentChildCountDto()
    if (unitId != -1){
      let childs = await this.getChildUnits(unitId)
      count.childs = childs.length
    } else {
      const parent = await this.repo.count({where: {parentUnit: IsNull(), status: 0}})
      const child = await this.repo.count({where: {parentUnit: Not(IsNull()), status: 0}})
  
      count.parents = parent
      count.childs = child
    }


    return count
  }

}
