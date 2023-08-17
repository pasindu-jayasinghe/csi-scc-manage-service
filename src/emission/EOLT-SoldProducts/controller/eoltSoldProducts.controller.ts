import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';

import { EndOfLifeTreatmentOfSoldProductsActivityData } from '../entities/eoltSoldProducts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { EndOfLifeTreatmentOfSoldProductsActivityDataDto } from '../dto/eoltSoldProducts.dto';
import { eoltSoldProductsService } from '../service/eoltSoldProducts.service';

@Crud({
  model: {
    type: EndOfLifeTreatmentOfSoldProductsActivityData,
  },
  query: {
    join: {
      project: {
        eager: true,
      },
      user: {
        eager: true,
      },
      unit: {
        eager: true
      }
    },
  },
})
// @ApiTags('Invest')
// @UseGuards(JwtAuthGuard)
@Controller('eolt-sold-products')
export class EndOfLifeTreatmentOfSoldProductsActivityDataController implements CrudController<EndOfLifeTreatmentOfSoldProductsActivityData> {
  constructor(
    public service: eoltSoldProductsService,
    @InjectRepository(EndOfLifeTreatmentOfSoldProductsActivityData)
    private readonly elecRepository: Repository<EndOfLifeTreatmentOfSoldProductsActivityData>,
  ) {}

  get base(): CrudController<EndOfLifeTreatmentOfSoldProductsActivityData> {
    return this;
  }

  @Post('save-eolt-sold-products')
  createAll(@Body() createProjectDto: EndOfLifeTreatmentOfSoldProductsActivityDataDto): Promise<EndOfLifeTreatmentOfSoldProductsActivityData> {
console.log("KKKKK",createProjectDto)
    return this.service.createAll(createProjectDto);
  }


  @Get('getInvestmentData/all')
  getAllEoltSoldProductsData(  @Query('page') page: number,
  @Query('limit') limit: number,@Query('projectId') projectId: number,@Query('unitId') unitId: number): Promise<any> {
    return this.service.getAllEoltSoldProductsData(  {
      limit: limit,
      page: page,
    },projectId,unitId);
  }
  @Get(':id')
  findOne(@Param('id') id: string): Promise<EndOfLifeTreatmentOfSoldProductsActivityData> {
    return this.service.findOne(+id);
  }

  @Patch('ghg/:id')
  updateAll(@Param('id') id: number, @Body() updateProjectDto: EndOfLifeTreatmentOfSoldProductsActivityDataDto) {
     return this.service.update(+id, updateProjectDto);
  }


  @Get('ghgh/getEntryById')
  async getEntryById(@Query("eid") eid: string): Promise<EndOfLifeTreatmentOfSoldProductsActivityDataDto> {
    return await this.service.getEntryById(eid);
  }


  @Post('ghgh/:eid')
  deleteEntry(@Param('eid') eid: number):  Promise<any>{
    return this.service.remove(+eid);
  }

  @Post('all/:eid')
  deleteAllEntry(@Param('eid') eid: string):  Promise<any>{
    return this.service.removeAll(eid);
  }

  @Delete('deleteSelectedALL')
  async deleteSelectedALL(
    @Query('groupNumber') groupNumbers: string[]
  ) {
     console.log("groupNumber",groupNumbers)
     for await(let groupNumber of groupNumbers){
      await this.service.deleteWholeGroup(groupNumber);

    }
    
    return true;
  }



}
