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

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { ApiTags } from '@nestjs/swagger';
import { ProcessingOfSoldProductsActivityData } from '../entities/processing-of-sold-product.entity';
import { ProcessingOfSoldProductsActivityDataDto } from '../dto/processing-of-sold-product-dto.dto';
import { ProcessingOfSoldProductsService } from '../service/processing-of-sold-product.service';
import { NetZeroDeletable } from 'src/emission/net-zero-deletbale';



@Crud({
  model: {
    type: ProcessingOfSoldProductsActivityData,
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
@Controller('ProcessingOfSoldProduct')
export class ProcessingOfSoldProductsActivityDataController implements CrudController<ProcessingOfSoldProductsActivityData>,NetZeroDeletable {
  constructor(
    public service: ProcessingOfSoldProductsService,
    @InjectRepository(ProcessingOfSoldProductsActivityData)
    private readonly elecRepository: Repository<ProcessingOfSoldProductsActivityData>,
  ) {}

  get base(): CrudController<ProcessingOfSoldProductsActivityData> {
    return this;
  }

  @Post('saveinvest')
  createAll(@Body() createProjectDto: ProcessingOfSoldProductsActivityDataDto): Promise<ProcessingOfSoldProductsActivityData> {

    return this.service.createAll(createProjectDto);
  }


  @Get('getUpstreamLeasedAssetsData/all')
  getAllUpstreamLeasedAssetsData(  @Query('page') page: number,
  @Query('limit') limit: number,@Query('projectId') projectId: number,@Query('unitId') unitId: number): Promise<any> {
    // console.log("groupNumber")
    return this.service.getAllUpstreamLeasedAssetsData(  {
      limit: limit,
      page: page,
    },projectId,unitId);
  }
  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProcessingOfSoldProductsActivityData> {
    return this.service.findOne(+id);
  }

  @Patch('ghg/:id')
  updateAll(@Param('id') id: number, @Body() updateProjectDto: ProcessingOfSoldProductsActivityDataDto) {
     return this.service.update(+id, updateProjectDto);
  }


  @Get('ghgh/getEntryById')
  async getEntryById(@Query("eid") eid: string): Promise<ProcessingOfSoldProductsActivityDataDto> {
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
    // console.log("groupNumber",groupNumbers)
    if(Array.isArray(groupNumbers)){
      for await(let groupNumber of groupNumbers){
        await this.service.deleteWholeGroup(groupNumber);

      }
    }else{
      await this.service.deleteWholeGroup(groupNumbers);
    }
    
    return true;
  }

}
