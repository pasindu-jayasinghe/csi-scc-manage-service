import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { RecordStatus } from 'src/shared/entities/base.tracking.entity';
import { Repository } from 'typeorm';
import { ProjectUnit } from '../entities/project-unit.entity';
import { DeactiveStatuses } from '../enum/project-status.enum';


@Injectable()
export class ProjectUnitService extends TypeOrmCrudService<ProjectUnit> {
  
  constructor(
    @InjectRepository(ProjectUnit) repo,

    @InjectRepository(ProjectUnit)
    private readonly projectUnitRepository: Repository<ProjectUnit>,
  ) {
    super(repo);
  }
  async create(createProjectUnitDto: ProjectUnit): Promise<ProjectUnit> {

    try{
      const updated = await this.repo.update( {
        project: {
            id: createProjectUnitDto.project.id,
        },
        unit: {
          id: createProjectUnitDto.unit.id
        }
      }, {status: RecordStatus.Active});
      if(updated.affected === 1){

        const pu = await this.repo.findOne({
          project: {
              id: createProjectUnitDto.project.id,
          },
          unit: {
            id: createProjectUnitDto.unit.id
          },
          status: RecordStatus.Active
        });
        return  pu;
      }else{
        const project = await this.projectUnitRepository.save(createProjectUnitDto)
        return project;
      }
    }catch(errr){
      console.error(errr)
      throw new InternalServerErrorException(errr);
    }
  }

  findAll() {
    return this.projectUnitRepository.find();
  }

  update(id: number, updateProjectUnitDto: ProjectUnit) {
    return `This action updates a #${id} ProjectUnit`;
  }

  remove(id: number) {
    return `This action removes a #${id} ProjectUnit`;
  }

  getProjectUnitByProjectType(ids: number[], projectType: string){

    let status =  RecordStatus.Active;
    let filter = `projectType.code =  :projectType and unit.id IN (:...ids) AND pu.status = :status`
    let data = this.repo.createQueryBuilder('pu')
      .innerJoin(
        'pu.unit',
        'unit',
        'unit.id = pu.unitId'
      ).innerJoin(
        'pu.project',
        'project',
        'project.id = pu.projectId'
      ).innerJoin(
        'project.projectType',
        'projectType',
        'projectType.id = project.projectTypeId'
      ) .select(['pu.id', 'project.id', 'projectType.code', 'project.year', 'project.emission', 'unit.id' ])
       .where(filter, {projectType, ids, status})


      return data.execute();
  }

  async getProjectUnitsByUntIdsAndProject(unitIds: number[], projectId: number) {
    let status = RecordStatus.Active;
    let filter = `unit.id IN (:...unitIds) AND pu.status = :status AND project.id = :projectId`
    let data = this.repo.createQueryBuilder('pu')
      .innerJoin(
        'pu.unit',
        'unit',
        'unit.id = pu.unitId'
      ).innerJoin(
        'pu.project',
        'project',
        'project.id = pu.projectId'
      ).innerJoin(
        'project.projectType',
        'projectType',
        'projectType.id = project.projectTypeId'
      )
      .where(filter, { unitIds, status, projectId })
      return await data.getMany();
  }

  async getProjectUnitsByUntIds(unitIds: number[]){
    let status = RecordStatus.Active;
    let filter = `unit.id IN (:...unitIds) AND pu.status = :status`
    let data = this.repo.createQueryBuilder('pu')
      .innerJoin(
        'pu.unit',
        'unit',
        'unit.id = pu.unitId'
      ).innerJoin(
        'pu.project',
        'project',
        'project.id = pu.projectId'
      ).innerJoin(
        'project.projectType',
        'projectType',
        'projectType.id = project.projectTypeId'
      )
      .where(filter, { unitIds, status })
      return await data.getMany();
  }


  async ComparisonGraphFac(unitId: number, projectId: number, projectType: string):Promise<any>{

    let status = RecordStatus.Active;
    try{
      let filterComparisonGraph = `projectType.code =  :projectType and unit.id = :unitId AND graph.status = :status`
      let data = this.repo.createQueryBuilder('graph')

      .innerJoin(
        'graph.unit',
        'unit',
        'unit.id = graph.unitId'
      )
      .innerJoin(
        'graph.project',
        'project',
        'project.id = graph.projectId'
      )
      .innerJoin(
        'project.projectType',
        'projectType',
        'projectType.id = project.projectTypeId'
      )
         .select(["unit.id","project.year",])
         .addSelect('SUM(project.emission)','total_emission' )
         .addSelect('SUM(project.directEmission)','total_directEmission' )
         .addSelect('SUM(project.indirectEmission)','total_indirectEmission' )
         .where(filterComparisonGraph, {projectType, unitId, status })
         .groupBy("project.year")
         .orderBy('project.year', 'ASC');
        //console.log(data.getQuery())   
        return await data.execute();
    }catch(errr){
      console.error(errr)
      throw new InternalServerErrorException(errr);
    }
  }
  
  async getLatestYearOfUnits(unitIds: number[], projectTyps: string):Promise<string> {
    let active = this.repo.createQueryBuilder('pu')
      .innerJoin(
        'pu.project',
        'project',
        'project.id = pu.projectId'
      )
      .innerJoin(
        'project.projectType',
        'projectType',
        'projectType.id = project.projectTypeId'
      )
      .select('project.year')
      .where('project.projectStatus NOT IN (:status) AND pu.id IN (:unitId) AND projectType.code = :code', { status: DeactiveStatuses, unitId: unitIds, code: projectTyps })

    let data = await active.execute()
    let years = [...new Set(data.map(o => { return (o.project_year) }))].sort()
    return (years[years.length-1]).toString();
  }

  
}
