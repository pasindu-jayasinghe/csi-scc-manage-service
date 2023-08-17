import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Methodology } from '../entities/methodology.entity';
import { ProjectType } from '../entities/project-type.entity';
import { MethodologyService } from './methodology.service';

@Injectable()
export class ProjectTypeService extends TypeOrmCrudService<ProjectType> {

  constructor(
    @InjectRepository(ProjectType) repo,

    @InjectRepository(ProjectType)
    private readonly ProjectTypeRepository: Repository<ProjectType>,
    private methodologyService: MethodologyService
  ) {
    super(repo);

  }
  async create(createProjectTypeDto: ProjectType) {
    return await this.ProjectTypeRepository.save(createProjectTypeDto);
  }

  findAll() {
    return this.ProjectTypeRepository.find();
  }

  

  update(id: number, updateProjectTypeDto: ProjectType) {
    return `This action updates a #${id} ProjectType`;
  }

  remove(id: number) {
    return `This action removes a #${id} ProjectType`;
  }


  async seed(){
    const pTypes = [
      {
          status: 0,
          name: "GHG Inventory",
          code: "GHG",
          methodologies: [
              {
                  status: 0,
                  name: "ISO14064 - IPCC Tier 2 Methodology",
              }
          ]
      }
    ]

    await Promise.all(pTypes.map(async data => {
      
      const types = await this.repo.find({code: data.code});
      if(types.length === 0){
        const pt = new ProjectType();
        pt.code = data.code;
        pt.name = data.name;
        const res = await this.repo.save(pt);
        if(res){
          await Promise.all(data.methodologies.map(async meth => {
            const ms = await this.methodologyService.find({name: meth.name});            
            if(ms.length==0){
              const m = new Methodology();
              m.name = meth.name;
              m.projectType = res
              this.methodologyService.create(m);
            }
          }))
        }
      }else{
        const type = types[0];
        await Promise.all(data.methodologies.map(async meth => {
            const ms = await this.methodologyService.find({name: meth.name});            
            if(ms.length==0){
              const m = new Methodology();
              m.name = meth.name;
              m.projectType = type
              this.methodologyService.create(m);
            }
        }))
      }


      

    }))
  }
}
