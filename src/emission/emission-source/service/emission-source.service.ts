import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { Repository } from 'typeorm';
import { EmissionSource } from '../entities/emission-source.entity';
@Injectable()
export class EmissionSourceService extends TypeOrmCrudService<EmissionSource> {


  constructor(
    @InjectRepository(EmissionSource) repo,
    @InjectRepository(EmissionSource)
    private readonly emissionSourceRepository: Repository<EmissionSource>,
  ) {
    super(repo);

  }

  async create(createEmissionSourceDto: EmissionSource) {
   return await this.emissionSourceRepository.save(createEmissionSourceDto);
  }

  findAll() {
    return this.emissionSourceRepository.find();
  }

  getOneEmissionSourceByCode(code :string){
    return this.emissionSourceRepository.findOne({code: code})
  }

  update(id: number, updateEmissionSourceDto: EmissionSource) {
    return `This action updates a #${id} EmissionSource`;
  }

  remove(id: number) {
    return `This action removes a #${id} EmissionSource`;
  }

  async seed() {
    let emissionSources = Object.values(sourceName)
    Promise.all(
      emissionSources.map(async source => {
        const ES = await this.repo.find({code: source})
        if (ES.length === 0){
          const eSource = new EmissionSource()
          eSource.code = source;
          eSource.name = source.split("_").join(" ")
          await this.emissionSourceRepository.save(eSource)
        }
      })
    )
  }


}
