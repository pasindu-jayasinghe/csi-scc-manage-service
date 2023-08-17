import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { Industry } from './entities/industry.entity';

import { Repository } from 'typeorm';


@Injectable()
export class IndustryService extends TypeOrmCrudService<Industry> {

  private industries: {name:string, code: string}[] = [
    {
      name: 'Energy',
      code: 'ENERGY'
    },{
      name: 'Manufacturing industry and construction',
      code: 'MAN_N_CON'
    },{
      name: 'Commercial/institutional',
      code: 'COM_INS'
    },{
      name: 'residential and agriculture/forestry/fishing/fishing',
      code: 'RES_N_AGRI_FOR_FISH'
    }
  ]

  constructor(
    @InjectRepository(Industry)repo,

    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
    ){
    super(repo);
  }

  async findbyCode(code: string){
    return await this.repo.findOne({
      where: {
        code: code,
      },
    })
  }

  async seed(){
    await Promise.all(this.industries.map(async industry => {
      const IN = await this.repo.find({code: industry.code});
      if(IN.length == 0){
        const ind = new Industry();
        ind.code = industry.code;
        ind.name = industry.name;
        await this.industryRepository.save(ind)
      }
    }))
  }


 
}
