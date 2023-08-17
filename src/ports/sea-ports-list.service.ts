import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Country } from 'src/country/entities/country.entity';
import { Repository } from 'typeorm';
import { AirPort } from './air-port-list.entity';
import { SeaPort } from './sea-port-list.entity';

@Injectable()
export class SeaPortService extends TypeOrmCrudService<SeaPort>{

  constructor(@InjectRepository(SeaPort) repo) {
    super(repo);
  }


  async findbyCountry(countryId: any) {

    return await this.repo
      .createQueryBuilder("airport")
      .leftJoinAndMapMany('airport.country', Country, 'cou', 'cou.id = airport.countryId')
      .where("airport.countryId = :countryId", { countryId: countryId })
      .getMany()
  }


}
