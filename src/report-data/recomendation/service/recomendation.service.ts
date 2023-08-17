import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Recomendation } from '../entities/recomendation.entity';

@Injectable()
export class RecomendationService extends TypeOrmCrudService<Recomendation>{
  
  constructor(
    @InjectRepository(Recomendation) repo,
    @InjectRepository(Recomendation)
    public readonly recomendationRepository: Repository<Recomendation>,

  ) {
    super(repo);
  }

  async create(createRecomendationDto: Recomendation) {

    return this.recomendationRepository.save(createRecomendationDto);
  }

  findAll() {

    return this.recomendationRepository.find();
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} recomendation`;
  // }

  async update(id: number, updateRecomendationDto: Recomendation) {
    
    const updated = await this.repo.update( {
      id: id
    }, updateRecomendationDto);
    if(updated.affected === 1){
      return this.repo.findOne(id);
    }else{
      throw new InternalServerErrorException("Updating is failed");
    }
  }

  remove(id: number) {
    return `This action removes a #${id} recomendation`;
  }
}
