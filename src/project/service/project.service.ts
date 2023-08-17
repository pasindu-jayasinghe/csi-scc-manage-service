import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { RecordStatus } from 'src/shared/entities/base.tracking.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { getConnection, In, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { ActiveClosedProjectDto, EmissionsDto, OrgEmissionDto } from '../dto/dashboard.dto';
import { UpdateProjectDto } from '../dto/update-project.dto'; 
import { ProjectSumDataReqDto } from '../dto/update-total-emission-req.dto';
import { Project } from '../entities/project.entity';
import { Clasification } from '../enum/clasification.enum';
import { ClosedStatuses, DeactiveStatuses, projectStatus } from '../enum/project-status.enum';

@Injectable()
export class ProjectService extends TypeOrmCrudService<Project> {
  constructor(
    @InjectRepository(Project) repo,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>
  ) {
    super(repo);
  }
  async create(createProjectDto: Project): Promise<Project> {
    const project  = await this.projectRepository.save(createProjectDto);
    return project;
  }

  findAll() {
    return this.projectRepository.find();
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    return await this.repo.update({id: id}, updateProjectDto);
  }

  async setOwnerUnit(id: number, unit: Unit){
    const updated = await this.repo.update( {
      id: id
    }, {ownerUnit: unit});

    if(updated.affected === 1){
      return {
        status: true,
        message: "Successfully added"
      };
    }else{
      return {
        status: false,
        message: "Failed to assigne"
      }
    }
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }

  async chnageStatus(projectId: number, status: projectStatus): Promise<Project> {
    let project = await this.repo.findOne(projectId);
    project.projectStatus = status;
    return this.repo.save(project);
  }

  async addPaymentRef(projectId: number, ref: string): Promise<Project> {
    let project = await this.repo.findOne(projectId);
    project.paymentReff = ref;
    return this.repo.save(project);
  }


  async updateProjectTotal(projectId: number, update: any){
    const queryRunner = getConnection().createQueryRunner();
    try{

      await queryRunner.connect()
      await queryRunner.startTransaction();
      let filter = `project.id =  :projectId`
      let data = queryRunner.manager.getRepository(Project)
        .createQueryBuilder('project')
        .useTransaction(true)
        .setLock("pessimistic_write")
        .where(filter, { projectId });

      const res = await data.getOne();
      if (res) {
        let d  = await data
          .useTransaction(true)
          .setLock("pessimistic_write")
          .update(Project)
          .set(update)
          .where("id = :id", { id: res.id })
          .execute()
        await queryRunner.commitTransaction();
      }
    } catch (err) {
      console.log("---------------------------- Updating updateProject tatal is failed ----------------------------")

      console.error(err)
      queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      queryRunner.release();
    }

  }

  async addEmission(req: ProjectSumDataReqDto) {
    let projectId = req.project.id
    const queryRunner = getConnection().createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction();
      let filter = `id =  :projectId`
      let data = queryRunner.manager.getRepository(Project)
        .createQueryBuilder('pues')
        .useTransaction(true)
        .setLock("pessimistic_write")
        .where(filter, { projectId });

      const res = await data.getOne();

      function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

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
          .update(Project)
          .set(update)
          .where("id = :id", { id: res.id })
          .execute()
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      console.log("---------------------------- Updating P tatal is failed ----------------------------")
      console.error(err)
      queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      queryRunner.release();
    }
  }

  async getOrgEmissions(ids: number[], type: string){
    let emissions: EmissionsDto[] = []
    let orgEmission = new OrgEmissionDto()
    let years = []
    let activeYears = []

    let data = this.repo.createQueryBuilder('project')
      .innerJoin(
        'project.projectType',
        'projectType',
        'projectType.id = project.projectTypeId'
      )
      .leftJoinAndSelect(
        'project.ownerUnit',
        'ownerUnit',
        'ownerUnit.id = project.ownerUnitId'
      )
      .where('projectType.code = :code AND ownerUnit.id IN (:ids) AND projectStatus NOT IN (:status)', {code: type, ids: ids, status: DeactiveStatuses})

    let projects = await data.getMany()

    // console.log(projects)

    projects.forEach(p => {
      if(p.projectStatus !== projectStatus.Initial){
        if (!DeactiveStatuses.includes(p.projectStatus)){
          activeYears.push(p.year)
          // orgEmission.activeYear = p.year
        }
      
        let key = p.year.toString()
        if (years.includes(key)){
          let e = emissions.find(o => o.year === key)
          e.direct += p.directEmission
          e.indirect += p.indirectEmission
          e.other += p.otherEmission
        } else {
          years.push(key)
          let e = new EmissionsDto()
          e.year = key
          e.direct = p.directEmission
          e.indirect = p.indirectEmission
          e.other = p.otherEmission
          emissions.push(e)
        }
      }      
    })

    activeYears.sort((a,b) => b-a) //if more than 1 active projects, get latest one
    orgEmission.activeYear = activeYears[0]
    orgEmission.emissions = emissions

    return orgEmission
  }

  async getClosedAndActiveProjectsCount(unitId?: number) {

    let projects = new ActiveClosedProjectDto()
    let active: SelectQueryBuilder<Project>
    let closed: SelectQueryBuilder<Project>
    if (unitId != -1) {
      active = this.repo.createQueryBuilder('p')
        .leftJoinAndSelect(
          'p.ownerUnit',
          'unit',
          'unit.id = p.ownerUnit'
        )
        .where('projectStatus NOT IN (:status) AND unit.id = :unitId', { status: DeactiveStatuses, unitId: unitId })

      closed = this.repo.createQueryBuilder('p')
        .leftJoinAndSelect(
          'p.ownerUnit',
          'unit',
          'unit.id = p.ownerUnit'
        )
        .where('projectStatus IN (:status) AND unit.id = :unitId', { status: ClosedStatuses, unitId: unitId })

      // closed = this.repo.createQueryBuilder('p')
      //   .where('projectStatus IN (:status)', { status: ClosedStatuses })
    } else {
      active = this.repo.createQueryBuilder('p')
        .where('projectStatus NOT IN (:status)', { status: DeactiveStatuses })

      closed = this.repo.createQueryBuilder('p')
        .where('projectStatus IN (:status)', { status: ClosedStatuses })


    }
    projects.active = await active.getCount()
    projects.closed = await closed.getCount()
    return projects
  }


  async makeALLTotalZerrow(projectId: number | null, unitId: number | null){
    let filter = {};
    if(projectId){
      filter['id'] = projectId
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

  async getMethodology(projectId: number){
    let p = await this.repo.findOne(projectId);
    return p.methodology.code
  }


  
}
