import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EmissionSourceService } from 'src/emission/emission-source/service/emission-source.service';
import { RecordStatus } from 'src/shared/entities/base.tracking.entity';
import { getConnection, In, Not, Repository } from 'typeorm';
import { ProjectUnitEmissionSource, Scope } from '../entities/project-unit-emission-source.entity';
import { ProjectUnitService } from './project-unit.service';
import { Tier } from '../enum/tier.enum';
import { Clasification } from '../enum/clasification.enum';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { PuesDataReqDto } from '../dto/pues-data-req.dto';
import { PuesDataDto } from '../dto/pues-data.dto';
import { SourceType } from '../dto/sourceType.enum';
import { UsersService } from 'src/users/users.service';
import { UnitService } from 'src/unit/unit.service';
import { Ownership } from '../enum/ownership.enum';
import { PuesSumDataReqDto } from '../dto/update-total-emission-req.dto';
import { DeactiveStatuses, projectStatus } from '../enum/project-status.enum';
import { Project } from '../entities/project.entity';
import { OrgEmissionDto, EsEmissionsDto } from '../dto/dashboard.dto';


@Injectable()
export class ProjectUnitEmissionSourceService extends TypeOrmCrudService<ProjectUnitEmissionSource> {
  constructor(
    private readonly emissionSourceService: EmissionSourceService,
    private readonly projectUnitService: ProjectUnitService,
    @InjectRepository(ProjectUnitEmissionSource) repo,
    @InjectRepository(ProjectUnitEmissionSource)
    private readonly ProjectUnitEmissionSourceRepository: Repository<ProjectUnitEmissionSource>,
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    private usersService: UsersService,
    private unitService: UnitService,
    
  ) {
    super(repo);
  }
  async create(createProjectUnitEmissionSourceDto: ProjectUnitEmissionSource): Promise<ProjectUnitEmissionSource> {
    return await this.ProjectUnitEmissionSourceRepository.save(createProjectUnitEmissionSourceDto)
  }

  findAll() {
    return this.ProjectUnitEmissionSourceRepository.find();
  }

  async update(id: number, updateProjectUnitEmissionSourceDto: ProjectUnitEmissionSource) {
    return await this.repo.update({id: id},updateProjectUnitEmissionSourceDto);
  }

  async makeALLTotalZerrow(projectId: number | null, unitId: number | null){
    // let es = await this.emissionSourceService.findOne({code: sourceName.passenger_road});

    let filter = {};
    if(projectId){
      let pus = await this.projectUnitService.find({project: {id: projectId}});
      let puIds = pus.map(p => p.id);
      filter['projectUnit'] = {id: In(puIds)}
    }
    await this.repo.update(filter,{
        indirectEsGTOne:0,
        directEmission : 0,
        directCH4Emission : 0,
        directCO2Emission : 0,
        directN2OEmission : 0,

        indirectEmission : 0,
        indirectCH4Emission : 0,
        indirectCO2Emission : 0,
        indirectN2OEmission : 0,

        otherEmission : 0,
        otherCH4Emission : 0,
        otherCO2Emission : 0,
        otherN2OEmission : 0
    })
  }

  remove(id: number) {
    return `This action removes a #${id} ProjectUnitEmissionSource`;
  }

  async removeByProjectUnitAndEmissionSource(projectUnitId: number, emissionSourceId: number){
    try{
      const updated = await this.repo.update( {
        projectUnit: {
            id: projectUnitId,
        },
        emissionSource: {
          id: emissionSourceId
        }
      }, {status: RecordStatus.Deleted});
      if(updated.affected === 1){
        return {
          status: true,
          message: "Successfully removed"
        };
      }else{
        return {
          status: false,
          message: "Failed to removed"
        }
      }
    }catch(errr){
      console.error(errr)
      throw new InternalServerErrorException(errr);
    }
  }

  // async removeByProjectUnitAndEmissionSourceMultiple(projectUnitIds: number[], emissionSourceId: number){
  //   try{
  //     const updated = await this.repo.update( {
  //       projectUnit: {
  //           id: In(projectUnitIds),
  //       },
  //       emissionSource: {
  //         id: emissionSourceId
  //       }
  //     }, {status: RecordStatus.Deleted});
  //     if(updated.affected >1){
  //       return {
  //         status: true,
  //         message: "Successfully removed"
  //       };
  //     }else{
  //       return {
  //         status: false,
  //         message: "Failed to removed"
  //       }
  //     }
  //   }catch(errr){
  //     console.error(errr)
  //     throw new InternalServerErrorException(errr);
  //   }
  // }


  async removeByProjectUnitAndEmissionSourceList(projectUnitIdList: number[], emissionSourceId: number){
    try{
      const updated = await this.repo.update( {
        projectUnit: {
            id: In(projectUnitIdList),
        },
        emissionSource: {
          id: emissionSourceId
        }
      }, {status: RecordStatus.Deleted});
      if(updated.affected === 1){
        return {
          status: true,
          message: "Successfully removed"
        };
      }else{
        return {
          status: false,
          message: "Failed to removed"
        }
      }
    }catch(errr){
      console.error(errr)
      throw new InternalServerErrorException(errr);
    }
  }

  async addProjectUnitEmissionSource(
    projectUnitId: number,
    emissionSourceId: number,
    tier: Tier,
    clasification: Clasification,
    mobile: boolean,
    stationery: boolean,
    scope: Scope
  ) {
    try {
      const updated = await this.repo.update({
        projectUnit: {
          id: projectUnitId,
        },
        emissionSource: {
          id: emissionSourceId
        }
      }, { status: RecordStatus.Active, tier: tier, clasification: clasification, mobile: mobile, stationery: stationery, scope: scope });
      if (updated.affected === 1) {
        return {
          status: true,
          message: "Successfully added"
        };
      } else {
        const projectUnit = await this.projectUnitService.findOne(projectUnitId);
        if (!projectUnit) throw new NotFoundException("ProjectUnit was not fount for id = " + projectUnitId);

        const emissionSource = await this.emissionSourceService.findOne(emissionSourceId);
        if (!emissionSource) throw new NotFoundException("EmissionSource was not fount for id = " + emissionSourceId);

        const projectUnitEmissionSource = new ProjectUnitEmissionSource();
        projectUnitEmissionSource.projectUnit = projectUnit;
        projectUnitEmissionSource.emissionSource = emissionSource;
        projectUnitEmissionSource.tier = tier;
        projectUnitEmissionSource.clasification = clasification;
        projectUnitEmissionSource.mobile = mobile;
        projectUnitEmissionSource.stationery = stationery;
        projectUnitEmissionSource.scope = scope;
        const savedErojectUnitEmissionSource = await this.repo.save(projectUnitEmissionSource);
        return {
          status: true,
          data: savedErojectUnitEmissionSource,
          message: "Successfully added"
        }
      }
    } catch (errr) {
      console.error(errr)
      throw new InternalServerErrorException(errr);
    }
  }

  async getProjectUnitEmissionSources(projectUnitId): Promise<ProjectUnitEmissionSource[]>{
    const puess = await this.repo.find({ projectUnit: { id: projectUnitId}, status: RecordStatus.Active});
    return puess;
  }

  getEmissionsByType(id: number) { // Not using
    let filter = `pu.projectId = ${id}`
    let data = this.repo.createQueryBuilder('pues')
      .innerJoin(
        'pues.projectUnit',
        'pu',
        'pu.id = pues.projectUnitId'
      ).where(filter, { id })
      .select(['pues.clasification'])
      .addSelect('SUM(pues.emission)', 'emission')
      .groupBy('pues.clasification');
      return data.execute();
  }

  getProjectUnitByType(id: number, type: string, projectType: string){ // NOT using

    let filter = `projectType.code =  :projectType and unit.id = :id and  pues.clasification = :type`
    let data = this.repo.createQueryBuilder('pues')
      .innerJoin(
        'pues.projectUnit',
        'projectUnit',
        'projectUnit.id = pues.projectUnitId'
      ).innerJoin(
        'projectUnit.unit',
        'unit',
        'unit.id = projectUnit.unitId'
      ).innerJoin(
        'projectUnit.project',
        'project',
        'project.id = projectUnit.projectId'
      ).innerJoin(
        'project.projectType',
        'projectType',
        'projectType.id = project.projectTypeId'
      ) 
      .select([ 'project.id', 'pues.clasification', 'projectType.code', 'project.year', 'unit.id' ])
      .addSelect('SUM(pues.emission)', 'project_emission')
      .where(filter, {projectType, id, type})
      // .groupBy('pues.id')
      .groupBy('project.year')


      return data.execute();
  }


  async hasPUES(unitId: number, projectId: number, esCode: sourceName){
    let recordStatus: number = RecordStatus.Deleted;
    let filter = `project.id =  :projectId and unit.id = :unitId and es.code = :esCode and pues.status <> :recordStatus`;
    try{
      let data = this.repo.createQueryBuilder('pues')
        .innerJoin(
          'pues.emissionSource',
          'es',
          'es.id = pues.emissionSource'
        )
        .innerJoin(
          'pues.projectUnit',
          'pu',
          'pu.id = pues.projectUnit'
        ).innerJoin(
          'pu.project',
          'project',
          'project.id = pu.projectId'
        ).innerJoin(
          'pu.unit',
          'unit',
          'unit.id = pu.unit'
        ) 
        .where(filter, {projectId, unitId, esCode, recordStatus });

        const res = await data.getCount();    
        // console.log("hasPUES", res)    
        return res > 0;
    }catch(errr){
      console.error(errr)
      throw new InternalServerErrorException(errr);
    }
  }

  async getByUnitAndProjectAndES(unitId: number, projectId: number, esCode: sourceName){
    try{
      let filter = `project.id =  :projectId and unit.id = :unitId and es.code = :esCode`
      let data = this.repo.createQueryBuilder('pues')
        .innerJoin(
          'pues.emissionSource',
          'es',
          'es.id = pues.emissionSource'
        )
        .innerJoin(
          'pues.projectUnit',
          'pu',
          'pu.id = pues.projectUnit'
        ).innerJoin(
          'pu.project',
          'project',
          'project.id = pu.projectId'
        ).innerJoin(
          'pu.unit',
          'unit',
          'unit.id = pu.unit'
        ) 
        // .select(['pu.id', 'project.id', 'projectType.code', 'project.year', 'project.emission', 'unit.id' ])
        .where(filter, {projectId, unitId, esCode });

        const res = await data.getOne();        
        return res;
    }catch(errr){
      console.error(errr)
      throw new InternalServerErrorException(errr);
    }
  }

  async getPuesData(req: PuesDataReqDto): Promise<PuesDataDto>{
    console.log("getPuesData req", req)
    const res = new PuesDataDto();        
    let unit;
    if(req.unitId){
      unit = await this.unitService.findOne(req.unitId);
    }else{
      unit = await this.usersService.getUnitByUser(req.user.id);
    }

    let pues = await this.getByUnitAndProjectAndES(unit.id, req.project.id, req.sourceName);
    // console.log("getPuesData res",pues)
    if(pues){

        if(pues.clasification !== Clasification.ANY){
            res.clasification = pues.clasification;
        }else{
          if(req.activityInfo.owenerShip){
            if(req.activityInfo.owenerShip === Ownership.RENTED){
              res.clasification = Clasification.DIRECT
            }
            if(req.activityInfo.owenerShip === Ownership.HIRED){
              if (req.activityInfo.paidByCompany !== undefined){
                res.clasification = req.activityInfo.paidByCompany || req.activityInfo.paidByCompany+'' == '1' ? Clasification.INDIRECT : Clasification.OTHER
              } else {
                res.clasification = Clasification.OTHER
              }
            }
            if(req.activityInfo.owenerShip === Ownership.OWN){
              res.clasification = Clasification.DIRECT
            }

            if(req.activityInfo.owenerShip === Ownership.OTHER){
              res.clasification = Clasification.OTHER
            }
          }
        }


        res.tier = pues.tier;

        if(pues.stationery && pues.mobile ){
            if(req.activityInfo.stationary){
                res.sourceType = SourceType.STATIOANRY;
            }else if(req.activityInfo.mobile){
                res.sourceType = SourceType.MOBILE;
            }else{
              res.sourceType = SourceType.BOTH;
            }
        }else{
            if(pues.stationery){
                res.sourceType = SourceType.STATIOANRY;
            }else if(pues.mobile){
                res.sourceType = SourceType.MOBILE;
            }
        }
      //  console.log("dfgdfg",unit)
        res.industry = unit.industry;
        res.countryCode = unit.country.code

    }

    console.log("getPuesData res",res)
    return res;
  }


  async getPRoadTotal(projectId: number){
    let emissionSource = sourceName.passenger_road;
    try{
      return  await this.repo
        .createQueryBuilder('entry')
        .innerJoin(
          'entry.projectUnit',
          'projectUnit',
          'projectUnit.id = entry.projectUnitId'
        )
        .innerJoin(
          'projectUnit.project',
          'project',
          'project.id = projectUnit.projectId'
        )
        .innerJoin(
          'entry.emissionSource',
          'emissionSource',
          'emissionSource.id = entry.emissionSourceId'
        )
        .select('SUM(entry.directEmission) as directEmission')
        .addSelect('SUM(entry.directCO2Emission) as directCO2Emission')
        .addSelect('SUM(entry.directCH4Emission) as directCH4Emission')
        .addSelect('SUM(entry.directN2OEmission) as directN2OEmission')
    
        .addSelect('SUM(entry.indirectEmission) as indirectEmission')
        .addSelect('SUM(entry.indirectCO2Emission) as indirectCO2Emission')
        .addSelect('SUM(entry.indirectCH4Emission) as indirectCH4Emission')
        .addSelect('SUM(entry.indirectN2OEmission) as indirectN2OEmission')

        .addSelect('SUM(entry.otherEmission) as otherEmission')
        .addSelect('SUM(entry.otherCO2Emission) as otherCO2Emission')
        .addSelect('SUM(entry.otherCH4Emission) as otherCH4Emission')
        .addSelect('SUM(entry.otherN2OEmission) as otherN2OEmission')
    
        .where('project.id = :projectId AND emissionSource.code = :emissionSource',{d: 1, projectId: projectId, emissionSource: emissionSource})
        .execute();
    }catch(err){
      console.log("getPRoadTotal --- ", err);
      return null;
    }
  }

  async updatePRoadEmission(directReq:PuesSumDataReqDto, indirectReq:PuesSumDataReqDto, otherReq: PuesSumDataReqDto ){
    let esCode = sourceName.passenger_road;
    let unit;
    let projectId;
    let unitId 
    if(directReq){
      unit = await this.unitService.findOne(directReq.unitId);
      projectId = directReq.project.id;
      unitId = unit.id
    }else if(indirectReq){
      unit = await this.unitService.findOne(indirectReq.unitId);
      projectId = indirectReq.project.id;
      unitId = unit.id
    }else if(otherReq){
      unit = await this.unitService.findOne(otherReq.unitId);
      projectId = otherReq.project.id;
      unitId = unit.id
    }

    if(unitId && projectId){
      const queryRunner = getConnection().createQueryRunner()

      try{
        await queryRunner.connect()
        await queryRunner.startTransaction();
        let filter = `project.id =  :projectId and unit.id = :unitId and es.code = :esCode`;
  
  
        let data =  queryRunner.manager.getRepository(ProjectUnitEmissionSource)
        .createQueryBuilder('pues')
        .innerJoin(
          'pues.emissionSource',
          'es',
          'es.id = pues.emissionSource'
        )
        .innerJoin(
          'pues.projectUnit',
          'pu',
          'pu.id = pues.projectUnit'
        ).innerJoin(
          'pu.project',
          'project',
          'project.id = pu.projectId'
        ).innerJoin(
          'pu.unit',
          'unit',
          'unit.id = pu.unit'
        ) 
        .where(filter, {projectId, unitId, esCode })
      
        const res = await data.getOne();
  
        // console.log("res -- ", res);
  
        if (res) {
          let update = {};
          if(directReq){
            update['directEmission']    = directReq.emission && directReq.emission.e_sc  ? directReq.emission.e_sc : 0;
            update['directCO2Emission'] = directReq.emission && directReq.emission.e_sc_co2  ? directReq.emission.e_sc_co2 : 0
            update['directCH4Emission'] = directReq.emission && directReq.emission.e_sc_ch4  ? directReq.emission.e_sc_ch4 : 0
            update['directN2OEmission'] = directReq.emission && directReq.emission.e_sc_n2o  ? directReq.emission.e_sc_n2o : 0;
          }
          if(indirectReq){
            update['indirectEmission']    = indirectReq.emission && indirectReq.emission.e_sc  ? indirectReq.emission.e_sc : 0;
            update['indirectCO2Emission'] = indirectReq.emission && indirectReq.emission.e_sc_co2  ? indirectReq.emission.e_sc_co2 : 0
            update['indirectCH4Emission'] = indirectReq.emission && indirectReq.emission.e_sc_ch4  ? indirectReq.emission.e_sc_ch4 : 0
            update['indirectN2OEmission'] = indirectReq.emission && indirectReq.emission.e_sc_n2o  ? indirectReq.emission.e_sc_n2o : 0;
          }
          if(otherReq){
            update['otherEmission']    = otherReq.emission && otherReq.emission.e_sc  ? otherReq.emission.e_sc : 0;
            update['otherCO2Emission'] = otherReq.emission && otherReq.emission.e_sc_co2  ? otherReq.emission.e_sc_co2 : 0
            update['otherCH4Emission'] = otherReq.emission && otherReq.emission.e_sc_ch4  ? otherReq.emission.e_sc_ch4 : 0
            update['otherN2OEmission'] = otherReq.emission && otherReq.emission.e_sc_n2o  ? otherReq.emission.e_sc_n2o : 0;
          }
          let d  = await data
              .useTransaction(true)
              .setLock("pessimistic_write")
              .update(ProjectUnitEmissionSource)
              .set(update)
              .where("id = :id", { id: res.id })
              .execute()
          await queryRunner.commitTransaction();
        }
      }catch (err) {
        console.log("---------------------------- Updating updatePRoadEmission tatal is failed ----------------------------")
        console.error(err)
        queryRunner.rollbackTransaction();
        // queryRunner.d
        throw new InternalServerErrorException(err);
      } finally {
        queryRunner.release();
      }
    }
  }

  async addEmission(req: PuesSumDataReqDto){
    // console.log("req.classification -------- ", req.classification);
    let unit = await this.unitService.findOne(req.unitId);
    let projectId = req.project.id
    let unitId = unit.id
    let esCode = req.sourceName
    const queryRunner = getConnection().createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction();
      let filter = `project.id =  :projectId and unit.id = :unitId and es.code = :esCode`;

      let data =  queryRunner.manager.getRepository(ProjectUnitEmissionSource)
        .createQueryBuilder('pues')
        .innerJoin(
          'pues.emissionSource',
          'es',
          'es.id = pues.emissionSource'
        )
        .innerJoin(
          'pues.projectUnit',
          'pu',
          'pu.id = pues.projectUnit'
        ).innerJoin(
          'pu.project',
          'project',
          'project.id = pu.projectId'
        ).innerJoin(
          'pu.unit',
          'unit',
          'unit.id = pu.unit'
        ) 
        .where(filter, {projectId, unitId, esCode })
      
      const res = await data.getOne()
        
        if (res) {
          let update = {};        
          if (req.classification === Clasification.DIRECT) {
            update['directEmission'] =    () => `directEmission + ${req.emission && req.emission.e_sc  ? req.emission.e_sc : 0}`;
            update['directCO2Emission'] = () =>   `directCO2Emission + ${req.emission && req.emission.e_sc_co2  ? req.emission.e_sc_co2 : 0}`;
            update['directCH4Emission'] = () =>  `directCH4Emission + ${req.emission && req.emission.e_sc_ch4  ? req.emission.e_sc_ch4 : 0}`;
            update['directN2OEmission'] = () => `directN2OEmission + ${req.emission && req.emission.e_sc_n2o  ? req.emission.e_sc_n2o : 0}`;
          }
          if (req.classification === Clasification.INDIRECT) {
            update['indirectEmission'] =     () => `indirectEmission + ${req.emission && req.emission.e_sc  ? req.emission.e_sc : 0}`;
            update['indirectCO2Emission'] =  () => `indirectCO2Emission + ${req.emission && req.emission.e_sc_co2  ? req.emission.e_sc_co2 : 0}`;
            update['indirectCH4Emission'] =  () => `indirectCH4Emission + ${req.emission && req.emission.e_sc_ch4  ? req.emission.e_sc_ch4 : 0}`;
            update['indirectN2OEmission'] =  () => `indirectN2OEmission + ${req.emission && req.emission.e_sc_n2o  ? req.emission.e_sc_n2o : 0}`;
          }
          if (req.classification === Clasification.OTHER) {
            update['otherEmission'] =  () => `otherEmission + ${req.emission && req.emission.e_sc  ? req.emission.e_sc : 0}`;
            update['otherCO2Emission'] = () =>  `otherCO2Emission + ${req.emission && req.emission.e_sc_co2  ? req.emission.e_sc_co2 : 0}`;
            update['otherCH4Emission'] = () =>  `otherCH4Emission + ${req.emission && req.emission.e_sc_ch4  ? req.emission.e_sc_ch4 : 0}`;
            update['otherN2OEmission'] = () =>  `otherN2OEmission + ${req.emission && req.emission.e_sc_n2o  ? req.emission.e_sc_n2o : 0}`;
          }

          let d  = await data
            .useTransaction(true)
            .setLock("pessimistic_write")
            .update(ProjectUnitEmissionSource)
            .set(update)
            .where("id = :id", { id: res.id })
            .execute()
        }



      await queryRunner.commitTransaction();
    } catch (err) {
      console.log("---------------------------- Updating PUES tatal is failed ----------------------------")
      console.error(err)
      queryRunner.rollbackTransaction();
      // queryRunner.d
      throw new InternalServerErrorException(err);
    } finally {
      queryRunner.release();
    }
  }  


  async ExicutiveSummaryGraphFac1(unitIds: number[], projectId: number):Promise<any>{

    try{
      let filterExicutiveGraph = `project.id =  :projectId and unit.id IN (:unitIds)`
      let data = this.repo.createQueryBuilder('graph')

        .innerJoin(
          'graph.projectUnit',
          'projectUnit',
          'projectUnit.id = graph.projectUnitId'
        ).innerJoin(
          'projectUnit.unit',
          'unit',
          'unit.id = projectUnit.unitId',
        ).innerJoin(
          'projectUnit.project',
          'project',
          'project.id = projectUnit.projectId'
        )
         .select('SUM(graph.directEmission)','directEmission' )
         .addSelect('SUM(graph.indirectEmission)','indirectEmission' )
         .addSelect('SUM(graph.otherEmission)','otherEmission' )
         .where(filterExicutiveGraph, {projectId, unitIds })

        //console.log(data.getQuery())   

        let d = await data.execute();
        return d;
    }catch(errr){
      console.error("errr ----------------- " , errr)
      throw new InternalServerErrorException(errr);
    }
  }




  async ExicutiveSummaryGraphFac2(unitIds: number[], projectId: number):Promise<any>{

    try{
      let filterExicutiveGraph = `project.id =  :projectId and unit.id IN (:unitIds) `
      let data = this.repo.createQueryBuilder('graph')

      .innerJoin(
        'graph.projectUnit',
        'projectUnit',
        'projectUnit.id = graph.projectUnitId'
      ).innerJoin(
        'projectUnit.unit',
        'unit',
        'unit.id = projectUnit.unitId',
      ).innerJoin(
        'projectUnit.project',
        'project',
        'project.id = projectUnit.projectId'
      )
        .innerJoin(
          'graph.emissionSource',
          'emissionSource',
          'emissionSource.id = graph.emissionSourceId'
        )

         .select(['project.id','emissionSource.name',"graph.directCO2Emission","graph.directEmission","graph.indirectEmission","graph.otherEmission"])
         .where(filterExicutiveGraph, {projectId, unitIds })

       // console.log(data.getQuery())   
        return await data.execute();
    }catch(errr){
      console.error(errr)
      throw new InternalServerErrorException(errr);
    }
  }


  async ResultGraphFac(unitIds: number[], projectId: number):Promise<any>{

    try{
      let filterResultGraph = `project.id =  :projectId and unit.id IN (:unitIds) `
      let data = this.repo.createQueryBuilder('graph')

      .innerJoin(
        'graph.projectUnit',
        'projectUnit',
        'projectUnit.id = graph.projectUnitId'
      ).innerJoin(
        'projectUnit.unit',
        'unit',
        'unit.id = projectUnit.unitId',
      ).innerJoin(
        'projectUnit.project',
        'project',
        'project.id = projectUnit.projectId'
      )
        .innerJoin(
          'graph.emissionSource',
          'emissionSource',
          'emissionSource.id = graph.emissionSourceId'
        )

         .select(['emissionSource.name',"SUM(graph.directEmission) as graph_directEmission","SUM(graph.indirectEmission) as graph_indirectEmission","graph.clasification "])
         .where(filterResultGraph, {projectId, unitIds })
        .groupBy('emissionSource.name, graph.clasification')
        // console.log(data.getQuery())  
        // console.log(data.getParameters()); 
        return await data.execute();
    }catch(errr){
      console.error("errr ---NOW---- ", errr)
      throw new InternalServerErrorException(errr);
    }
  }



  async ComparisonGraphFac2(unitId: number, projectId: number, projectType: string):Promise<any>{

    try{
      let filterComparisonGraph = `projectType.code =  :projectType and unit.id = :unitId `
      let data = this.repo.createQueryBuilder('graph')
      .innerJoin(
        'graph.emissionSource',
        'emissionSource',
        'emissionSource.id = graph.emissionSourceId'
      )
      .innerJoin(
        'graph.projectUnit',
        'projectUnit',
        'projectUnit.id = graph.projectUnitId'
      ).innerJoin(
        'projectUnit.unit',
        'unit',
        'unit.id = projectUnit.unitId',
      ).innerJoin(
        'projectUnit.project',
        'project',
        'project.id = projectUnit.projectId'
      ).innerJoin(
        'project.projectType',
        'projectType',
        'projectType.id = project.projectTypeId'
      )
         .select(['project.id',"graph.directEmission","graph.indirectEmission","project.year","emissionSource.name"])
        //.addSelect("emissionSource.name",'emissionSource' )
        // .addSelect('SUM(graph.indirectEmission)','indirectEmission' )
        // .addSelect('SUM(graph.otherEmission)','otherEmission' )
        .where(filterComparisonGraph, {projectType, unitId })
        .groupBy("emissionSource.name")
        .orderBy('project.year', 'ASC');
        // .groupBy("project.year")
        
        //console.log(data.getQuery())   
        return await data.execute();
    }catch(errr){
      console.error(errr)
      throw new InternalServerErrorException(errr);
    }
  }

  async getOrgEmissionSourceEmissions(unitIds: number[], type: string){
    let orgEmission = new OrgEmissionDto()
    let ess = []
    let emissions = []
    let pus = await this.projectUnitService.getProjectUnitByProjectType(unitIds, type)
    let puIds = []
    let activeYears = []

    for await (const pu of pus) {
      // let project = await this.projectRepo.findOne({id:  pu.project_id})
      let q = this.projectRepo.createQueryBuilder('project')
      .leftJoinAndSelect(
        'project.ownerUnit',
        'unit',
        'unit.id = project.ownerUnitId'
      )
      .where('project.id = :id', {id: pu.project_id })
      let project = await q.getOne()
      if (!DeactiveStatuses.includes(project.projectStatus)){
        // puIds.push(pu.pu_id)
        activeYears.push({unit: project.ownerUnit.id, year: project.year})
      }
    }
    activeYears.sort((a,b) => b.year-a.year) //if more than 1 active projects, get latest one
    orgEmission.activeYear = activeYears[0].year


    let p = await this.projectRepo.findOne({year:  activeYears[0].year, ownerUnit: {id: activeYears[0].unit}, projectStatus: Not(projectStatus.Initial)})

    for await (const pu of pus) {
      if (pu.project_id === p.id) {
        puIds.push(pu.pu_id)
      }
    }

    let pues = await this.repo.find({
      relations: ['projectUnit'],
      where: {
        projectUnit: {id: In(puIds)}
      }
    })

    pues.forEach(es => {
      if (es.emissionSource){
        if (ess.includes(es.emissionSource.code)){
          let oe = emissions.find(o => o.es === es.emissionSource.code)
          oe.emission += es.directEmission + es.indirectEmission + es.otherEmission
        } else {
          ess.push(es.emissionSource.code)
          let esEmission = new EsEmissionsDto()
          esEmission.es = es.emissionSource.code
          esEmission.name = es.emissionSource.name
          esEmission.emission = es.directEmission + es.indirectEmission + es.otherEmission
          emissions.push(esEmission)
        }
      }

    })
    orgEmission.emissions = emissions

    return orgEmission
  }

  async getSumForProjectUnits(puIds: number[], projectType: string){
    let activeStatus = RecordStatus.Active

    let data = this.repo.createQueryBuilder('pues')
      .innerJoin(
        'pues.projectUnit',
        'projectUnit',
        'projectUnit.id = pues.projectUnitId'
      ).innerJoin(
        'projectUnit.project',
        'project',
        'project.id = projectUnit.projectId'
      ).innerJoin(
        'project.projectType',
        'projectType',
        'projectType.id = project.projectTypeId'
      )
      .select('SUM(pues.directEmission) AS directEmission, SUM(pues.indirectEmission) AS indirectEmission, SUM(pues.otherEmission) AS otherEmission, projectUnit.id, project.year')
      .where('projectUnit.id IN (:ids) AND projectType.code = :type AND pues.status = :status', { ids: puIds, type: projectType, status: activeStatus })
      .groupBy("projectUnit.id, project.year");

    return await data.execute()
  }

  async getProjectUnitESListByProjectUntIds(ids: number[]) {
    
    let status =  RecordStatus.Active;
    let data = this.repo.createQueryBuilder('pues')
      .innerJoinAndSelect(
        'pues.projectUnit',
        'projectUnit',
        'projectUnit.id = pues.projectUnitId'
      ).innerJoinAndSelect(
        'pues.emissionSource',
        'emissionSource',
        'emissionSource.id = pues.emissionSourceId'
      )
      .where('projectUnit.id IN (:...ids) AND pues.status = :status', { ids, status })
    return await data.execute()
  }

  async esEmissionChartData(unitIds: number[], projectType: string){
    let years: any[] = [];
    let esData: any = {};
    let pus = await this.projectUnitService.getProjectUnitByProjectType(unitIds, projectType)

    if(pus.length > 0){
      let pUnitIds: number[] = []
      let puYears: any = {}
      let projIds: any[] = []
      let projid: any = {}
      pus.forEach((pu: any) => {
        pUnitIds.push(pu.pu_id)
        projid = { year: pu.project_year, p_id: pu.project_id }
        projIds.push(projid)
        puYears[pu.pu_id] = pu.project_year
        years.push(pu.project_year)
      })
      years = [...new Set(years)]

      let data = await this.getProjectUnitESListByProjectUntIds(pUnitIds);

      data.map((p: { emissionSource_code: string; projectUnit_id: string | number; pues_directEmission: any; pues_indirectEmission: any; pues_otherEmission: any; }) => {
        if (Object.keys(esData).includes(p.emissionSource_code)) {
        esData[p.emissionSource_code].push({ year: puYears[p.projectUnit_id], data: p.pues_directEmission + p.pues_indirectEmission + p.pues_otherEmission })
        } else {
          esData[p.emissionSource_code] = [{ year: puYears[p.projectUnit_id], data: p.pues_directEmission + p.pues_indirectEmission + p.pues_otherEmission }]
        }
      })
      return {
        years: years,
        esData: esData
      }
    }else{
      return null
    }

  }

  async PUESListBYProjectAndUYnit(unitId: number, projectId: number) {
    
    let status =  RecordStatus.Active;
    let data = this.repo.createQueryBuilder('pues')
      .innerJoinAndSelect(
        'pues.projectUnit',
        'projectUnit',
        'projectUnit.id = pues.projectUnitId'
      ).innerJoinAndSelect(
        'projectUnit.unit',
        'unit',
        'unit.id = projectUnit.unitId'
      ).innerJoinAndSelect(
        'projectUnit.project',
        'project',
        'project.id = projectUnit.projectId'
      )
      .innerJoinAndSelect(
        'pues.emissionSource',
        'emissionSource',
        'emissionSource.id = pues.emissionSourceId'
      )
      .select('emissionSource')
      .where('project.id = :projectId AND unit.id = :unitId AND pues.status = :status', { projectId, unitId, status })
    return await data.getMany()
  }

  async getPUESAndUnit(projectId: number){
    let data = this.repo.createQueryBuilder('pues')
    .innerJoinAndSelect(
      'pues.projectUnit',
      'projectUnit',
      'projectUnit.id = pues.projectUnitId'
    ).innerJoinAndSelect(
      'projectUnit.unit',
      'unit',
      'unit.id = projectUnit.unitId'
    ).innerJoinAndSelect(
      'projectUnit.project',
      'project',
      'project.id = projectUnit.projectId'
    )
      .select('SUM(pues.directEmission)', 'directEmission')
      .addSelect('SUM(pues.indirectEmission)', 'indirectEmission')
      .addSelect('SUM(pues.otherEmission)', 'otherEmission')
      .addSelect(['unit.name', 'unit.levelName'])
      .addSelect('SUM(pues.directEmission) + SUM(pues.indirectEmission) + SUM(pues.otherEmission)', 'total')
      .addSelect('unit.id as id')
      .where('project.id  = :id', { id: projectId })
      .groupBy('unit.id')
    // console.log(await data.execute(), await data.getCount())

    return await data.execute()
  }


  async getAllowedUnitsforProjectAndEs( projectId: number,es: sourceName) {
    
    let status =  RecordStatus.Active;
    let data = this.repo.createQueryBuilder('pues')
      .innerJoin(
        'pues.projectUnit',
        'projectUnit',
        'projectUnit.id = pues.projectUnitId'
      ).innerJoinAndSelect(
        'projectUnit.unit',
        'unit',
        'unit.id = projectUnit.unitId'
      ).innerJoin(
        'projectUnit.project',
        'project',
        'project.id = projectUnit.projectId'
      )
      .innerJoin(
        'pues.emissionSource',
        'emissionSource',
        'emissionSource.id = pues.emissionSourceId'
      )
      .select('unit.id as code, unit.name, pues.clasification, pues.mobile, pues.stationery')
      .where('project.id = :projectId AND pues.status = :status AND emissionSource.code =:es', { projectId, status,es })
      // console.log(data.getQuery());
      // console.log(data.getParameters());
    return await data.execute()
  }

  
}
