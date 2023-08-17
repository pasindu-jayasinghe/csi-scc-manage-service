// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
// import { GasBiomassDto } from '../../calculation/dto/gas-biomass.dto'; 
// import { Repository } from 'typeorm';
// import { GasBiomassActivityData } from '../entities/gas-biomass.entity';
// import { CalculationService } from '../../calculation/calculation.service';
// import { sourceName } from '../../enum/sourcename.enum';

// @Injectable()
// export class GasBiomassService extends TypeOrmCrudService<GasBiomassActivityData> {
//   constructor(
//     @InjectRepository(GasBiomassActivityData) repo,
//     @InjectRepository(GasBiomassActivityData)
//     private readonly gasbiomassRepository: Repository<GasBiomassActivityData>,
//     private readonly calculationService: CalculationService,
//   ) {
//     super(repo);
//   }

//   async create(createGasBiomassDto: GasBiomassActivityData) {
//     const calculationData: GasBiomassDto = {
//       year: createGasBiomassDto.year,
//       countryCode: createGasBiomassDto.countryCode, // TODO: impl after org structure
//       fcn: createGasBiomassDto.fcn,
//       type: createGasBiomassDto.type,
//     };
//     const e_sc = await this.calculationService.calculate({
//       sourceName: sourceName.GasBiomass,
//       data: calculationData,
//     });
//     createGasBiomassDto.e_sc = e_sc.result;

//     createGasBiomassDto.e_sc =  0;
//     createGasBiomassDto.e_sc_co2 =  0;
//     createGasBiomassDto.e_sc_ch4 =  0;
//     createGasBiomassDto.e_sc_n2o =  0;

//     return await this.gasbiomassRepository.save(createGasBiomassDto);
//   }

//   findAll() {
//     return this.gasbiomassRepository.find();
//   }

//   update(id: number, updateGasBiomassDto: GasBiomassActivityData) {
//     return `This action updates a #${id} project`;
//   }

//   remove(id: number) {
//     return `This action removes a #${id} project`;
//   }
// }
