import { forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ProjectService } from 'src/project/service/project.service';
import { RecordStatus } from 'src/shared/entities/base.tracking.entity';
import { getConnection, Not, Repository } from 'typeorm';
import { EmissionSourceService } from './emission-source.service';
import { EmissionSource } from '../entities/emission-source.entity';
import { ProjectEmissionSource } from '../entities/project-emission-source.entity';
import { Clasification } from 'src/project/enum/clasification.enum';
import { PesSumDataReqDto } from 'src/project/dto/update-total-emission-req.dto';
import { Project } from 'src/project/entities/project.entity';
import { PesEmissionsDto } from '../dto/pes-emissions.dto';
import { sourceName } from 'src/emission/enum/sourcename.enum';


@Injectable()
export class ProjectEmissionSourceService extends TypeOrmCrudService<ProjectEmissionSource> {
  constructor( 
    private readonly projectService: ProjectService,
    @Inject(forwardRef(() => EmissionSourceService))
    private readonly emissionSourceService: EmissionSourceService,
    @InjectRepository(ProjectEmissionSource) repo,
    @InjectRepository(ProjectEmissionSource)
    private readonly ProjectEmissionSourceRepository: Repository<ProjectEmissionSource>,

    @InjectRepository(EmissionSource)
    private readonly emissionRepo: Repository<EmissionSource>,
  ) {
    super(repo);

  }

  async create(createProjectEmissionSourceDto: ProjectEmissionSource) {
   return await this.ProjectEmissionSourceRepository.save(createProjectEmissionSourceDto);
  }

  findAll() {
    return this.ProjectEmissionSourceRepository.find();
  }

  async makeALLTotalZerrow(projectId: number | null, unitId: number | null){
    // let es = await this.emissionRepo.findOne({code: sourceName.passenger_road});
    let filter = {};
    if(projectId){
      filter['project'] = {id: projectId}
    }
    await this.ProjectEmissionSourceRepository.update(filter,{
        indirectEsGTOne: 0,
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

  async update(id: number, updateProjectEmissionSourceDto: ProjectEmissionSource) {
    return await this.repo.update({id:id}, updateProjectEmissionSourceDto);
  }

  remove(id: number) {
    return `This action removes a #${id} ProjectEmissionSource`;
  }

  async removeByProjectAndEmissionSource(projectId: number, emissionSourceId: number) {
    try{
      const updated = await this.repo.update( {
        project: {
            id: projectId,
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

  async addProjectEmissionSource(projectId: number, emissionSourceId: number) {
    try{
      const updated = await this.repo.update( {
        project: {
            id: projectId,
        },
        emissionSource: {
          id: emissionSourceId
        }
      }, {status: RecordStatus.Active});
      if(updated.affected === 1){
        return {
          status: true,
          message: "Successfully added"
        };
      }else{
        const project = await this.projectService.findOne(projectId);
        if(!project)throw new NotFoundException("Project was not fount for id = "+ projectId);

        const emissionSource = await this.emissionSourceService.findOne(emissionSourceId);
        if(!emissionSource)throw new NotFoundException("EmissionSource was not fount for id = "+ emissionSourceId);

        const projectEmissionSource = new ProjectEmissionSource();
        projectEmissionSource.project = project;
        projectEmissionSource.emissionSource = emissionSource;
        const savedErojectEmissionSource  = await this.repo.save(projectEmissionSource);
        return {
          status: true,
          data: savedErojectEmissionSource,
          message: "Successfully added" 
        }
      }
    }catch(errr){
      console.error(errr)
      throw new InternalServerErrorException(errr);
    }
  }

  async getProjectEmissionSources(projectId): Promise<PesEmissionsDto[]>{
    const pess = await this.repo.find({ project: { id: projectId}, status: RecordStatus.Active});

    const result = pess.filter((obj) => {
      return obj.emissionSource.code === 'passenger_road';
    });

    console.log("xxxxxxxxxxxxx", result)

    // console.log("ddddd",result)
    // let ss =  pess.map(p => p.emissionSource);
    // console.log("ddddd",ss)

    let ss =  pess.map(p => {
      let pes = new PesEmissionsDto()
      pes.total = p.directEmission + p.indirectEmission + p.otherEmission;
      pes.direct =  p.directEmission;
      pes.indirect = p.indirectEmission;
      pes.other = p.otherEmission;
      pes.es = p.emissionSource
      return pes
    });

    // console.log(ss)

    return ss
  }

  async getProjectTotal(projectId: number){
    try{
      return  await this.repo
        .createQueryBuilder('entry')
        .innerJoin(
          'entry.project',
          'project',
          'project.id = entry.projectId'
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
    
        .where('project.id = :projectId',{ projectId: projectId})
        .execute();
    }catch(err){
      console.log("getProjectTotal --- ", err);
      return null;
    }
  }


  async updatePRoad(projectId: number, update: any){
    let esCode = sourceName.passenger_road;
    const queryRunner = getConnection().createQueryRunner();
    try{

      await queryRunner.connect()
      await queryRunner.startTransaction();
      let filter = `project.id =  :projectId and es.code = :esCode`
      let data = queryRunner.manager.getRepository(ProjectEmissionSource)
        .createQueryBuilder('pes')
        .useTransaction(true)
        .innerJoin(
          'pes.emissionSource',
          'es',
          'es.id = pes.emissionSource'
        ).innerJoin(
          'pes.project',
          'project',
          'project.id = pes.projectId'
        )
        .setLock("pessimistic_write")
        .where(filter, { projectId, esCode });

      const res = await data.getOne();
      if (res) {
        let d  = await data
          .useTransaction(true)
          .setLock("pessimistic_write")
          .update(ProjectEmissionSource)
          .set(update)
          .where("id = :id", { id: res.id })
          .execute()
        await queryRunner.commitTransaction();
      }
    } catch (err) {
      console.log("---------------------------- Updating updatePRoad tatal is failed ----------------------------")

      console.error(err)
      queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      queryRunner.release();
    }

  }
  

  async addEmission(req: PesSumDataReqDto) {
    let projectId = req.project.id
    let esCode = req.sourceName


    const queryRunner = getConnection().createQueryRunner()
    try {
      await queryRunner.connect()
      await queryRunner.startTransaction();
      let filter = `project.id =  :projectId and es.code = :esCode`
      let data = queryRunner.manager.getRepository(ProjectEmissionSource)
        .createQueryBuilder('pes')
        .useTransaction(true)
        .innerJoin(
          'pes.emissionSource',
          'es',
          'es.id = pes.emissionSource'
        ).innerJoin(
          'pes.project',
          'project',
          'project.id = pes.projectId'
        )
        .setLock("pessimistic_write")
        .where(filter, { projectId, esCode });

      const res = await data.getOne();

      if (res) {

        let update = {};
        if (req.classification === Clasification.DIRECT) {
          update['directEmission'] =    () => `directEmission + ${req.emission.e_sc  ? req.emission.e_sc : 0}`;
          update['directCO2Emission'] = () =>   `directCO2Emission + ${req.emission.e_sc_co2  ? req.emission.e_sc_co2 : 0}`;
          update['directCH4Emission'] = () =>  `directCH4Emission + ${req.emission.e_sc_ch4  ? req.emission.e_sc_ch4 : 0}`;
          update['directN2OEmission'] = () => `directN2OEmission + ${req.emission.e_sc_n2o  ? req.emission.e_sc_n2o : 0}`;
        }
        if (req.classification === Clasification.INDIRECT) {
          update['indirectEmission'] =     () => `indirectEmission + ${req.emission.e_sc  ? req.emission.e_sc : 0}`;
          update['indirectCO2Emission'] =  () => `indirectCO2Emission + ${req.emission.e_sc_co2  ? req.emission.e_sc_co2 : 0}`;
          update['indirectCH4Emission'] =  () => `indirectCH4Emission + ${req.emission.e_sc_ch4  ? req.emission.e_sc_ch4 : 0}`;
          update['indirectN2OEmission'] =  () => `indirectN2OEmission + ${req.emission.e_sc_n2o  ? req.emission.e_sc_n2o : 0}`;
        }
        if (req.classification === Clasification.OTHER) {
          update['otherEmission'] =  () => `otherEmission + ${req.emission.e_sc  ? req.emission.e_sc : 0}`;
          update['otherCO2Emission'] = () =>  `otherCO2Emission + ${req.emission.e_sc_co2  ? req.emission.e_sc_co2 : 0}`;
          update['otherCH4Emission'] = () =>  `otherCH4Emission + ${req.emission.e_sc_ch4  ? req.emission.e_sc_ch4 : 0}`;
          update['otherN2OEmission'] = () =>  `otherN2OEmission + ${req.emission.e_sc_n2o  ? req.emission.e_sc_n2o : 0}`;
        }

        let d  = await data
          .useTransaction(true)
          .setLock("pessimistic_write")
          .update(ProjectEmissionSource)
          .set(update)
          .where("id = :id", { id: res.id })
          .execute()
      }

      await queryRunner.commitTransaction();

    } catch (err) {
      console.log("---------------------------- Updating PES tatal is failed ----------------------------")

      console.error(err)
      queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      queryRunner.release();
    }
  }
  
  async etEmissionsTotals(projectId:number){


    let data = this.repo
    .createQueryBuilder('pes')
  
  .leftJoinAndMapOne(
    'pes.emissionSourceId',
    EmissionSource,
    'es',
    'es.id = pes.emissionSourceId',
  ) .select([
    'pes.directEmission as directEmission',
    'pes.indirectEmission as indirectEmission',
    'pes.otherEmission as otherEmission',
    'es.name as emissionSourseName',
    'es.sbtName as sbtSourseName',
  ])
    .where('pes.projectId=:projectId', {
     projectId
    })
    
    

    return await data.execute();

  }


}
