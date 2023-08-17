import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Methodology } from '../entities/methodology.entity';

@Injectable()
export class MethodologyService extends TypeOrmCrudService<Methodology> {

  constructor(
    @InjectRepository(Methodology) repo,

    @InjectRepository(Methodology)
    private readonly MethodologyRepository: Repository<Methodology>,
  ) {
    super(repo);

  }
  async create(createMethodologyDto: Methodology) {

    let newMethodology = new Methodology();
    newMethodology.name = createMethodologyDto.name;
    newMethodology.code = newMethodology.name.toUpperCase().replace(" ", "_");
    newMethodology.description = createMethodologyDto.description;

    var newMethodologyDB = await this.MethodologyRepository.save(newMethodology);

    return newMethodologyDB;
  }

  findAll() {
    return this.MethodologyRepository.find();
  }

  

  update(id: number, updateMethodologyDto: Methodology) {
    return `This action updates a #${id} Methodology`;
  }

  remove(id: number) {
    return `This action removes a #${id} Methodology`;
  }
}
