import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Mitigation } from '../entities/mitigation.entity';

@Injectable()
export class MitigationService extends TypeOrmCrudService<Mitigation> {
  
  constructor(
    @InjectRepository(Mitigation) repo,
    @InjectRepository(Mitigation)
    public readonly mitigationRepository: Repository<Mitigation>,

  ) {
    super(repo);
  }

 async create(createMitigationDto: Mitigation) {

    return this.mitigationRepository.save(createMitigationDto);
  }

  findAll() {
    return this.mitigationRepository.find();
  }

  async update(id: number, updateMitigationDto: Mitigation) {
    
    const updated = await this.repo.update( {
      id: id
    }, updateMitigationDto);
    if(updated.affected === 1){
      return this.repo.findOne(id);
    }else{
      throw new InternalServerErrorException("Updating is failed");
    }
  }

  remove(id: number) {
    return `This action removes a #${id} mitigation`;
  }
}
