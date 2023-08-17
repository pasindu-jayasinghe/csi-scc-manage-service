import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { Country } from './entities/country.entity';

@Injectable()
export class CountryService extends TypeOrmCrudService<Country>{

  constructor( @InjectRepository(Country)repo){
    super(repo);
  }

  // async create(createCountryDto: Country) {
  //   return await this.repo.save(createCountryDto);
  // }

  // findAll() {
  //   return this.repo.find();
  // }

  async findbyCountryCode(code: string){
    return await this.repo.findOne({
      where: {
        code: code,
      },
    })
  }

  // // findOne(id: number) {
  // //   return `This action returns a #${id} country`;
  // // }

  // update(id: number, updateCountryDto: UpdateCountryDto) {
  //   return `This action updates a #${id} country`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} country`;
  // }
}
