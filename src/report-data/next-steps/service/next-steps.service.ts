import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { NextStep } from '../entities/next-step.entity';

@Injectable()
export class NextStepsService extends TypeOrmCrudService<NextStep>{
  
  constructor(
    @InjectRepository(NextStep) repo,
    @InjectRepository(NextStep)
    public readonly nextStepsRepository: Repository<NextStep>,

  ) {
    super(repo);
  }
  
  async create(createNextStepDto: NextStep) {

    return this.nextStepsRepository.save(createNextStepDto);
  }

  findAll() {
    return this.nextStepsRepository.find();
  }


  async update(id: number, updateNextStepDto: NextStep) {
    
    const updated = await this.repo.update( {
      id: id
    }, updateNextStepDto);
    if(updated.affected === 1){
      return this.repo.findOne(id);
    }else{
      throw new InternalServerErrorException("Updating is failed");
    }
  }

  remove(id: number) {
    return `This action removes a #${id} nextStep`;
  }
}
