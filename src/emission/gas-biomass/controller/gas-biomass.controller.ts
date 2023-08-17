// import { Controller, Get, Post, Body, Patch, Param, Delete,} from '@nestjs/common';
// import { Crud, CrudController } from '@nestjsx/crud';
// import { GasBiomassService } from '../service/gas-biomass.service';
// import { GasBiomassActivityData } from '../entities/gas-biomass.entity';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
  
//   @Crud({
//     model: {
//       type: GasBiomassActivityData,
//     },
//     query: {
//       join: {
//         project: {
//           eager: true,
//         },
//         unit: {
//           eager: true
//         },
//         user: {
//           eager: true,
//         }
//       },
//     },
//   })
//   @Controller('gas-biomass')
//   export class GasBiomassActivityDataController implements CrudController<GasBiomassActivityData> {
//     constructor(
//       public service: GasBiomassService,
//       @InjectRepository(GasBiomassActivityData)
//       private readonly gasRepository: Repository<GasBiomassActivityData>,
//     ) {}
  
//     get base(): CrudController<GasBiomassActivityData> {
//       return this;
//     }
  
//     @Post()
//     create(@Body() createProjectDto: GasBiomassActivityData): Promise<GasBiomassActivityData> {
//       return this.service.create(createProjectDto);
//     }
  
//     @Get(':id')
//     findOne(@Param('id') id: string): Promise<GasBiomassActivityData> {
//       return this.service.findOne(+id);
//     }
  
//     @Patch(':id')
//     update(@Param('id') id: string, @Body() updateProjectDto: GasBiomassActivityData) {
//       return this.service.update(+id, updateProjectDto);
//     }
//     //
//     // @Delete(':id')
//     // remove(@Param('id') id: string) {
//     //   return this.service.remove(+id);
//     // }
//   }
  