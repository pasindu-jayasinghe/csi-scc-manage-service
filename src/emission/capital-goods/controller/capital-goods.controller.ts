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
import { CapitalGoodsActivityDataDto } from '../dto/capital-goods.dto';
import { CapitalGoodsActivityData } from '../entities/capital-goods.entity';
import { capitalGoodsService } from '../service/capital-goods.service';


@Crud({
  model: {
    type: CapitalGoodsActivityData,
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
@Controller('capital-goods')
export class CapitalGoodsActivityDataController implements CrudController<CapitalGoodsActivityData> {
  constructor(
    public service: capitalGoodsService,
    @InjectRepository(CapitalGoodsActivityData)
    private readonly elecRepository: Repository<CapitalGoodsActivityData>,
  ) {}

  get base(): CrudController<CapitalGoodsActivityData> {
    return this;
  }

  @Post('save-capital-goods')
  createAll(@Body() createProjectDto: CapitalGoodsActivityDataDto): Promise<CapitalGoodsActivityData> {
console.log("KKKKK",createProjectDto)
    return this.service.createAll(createProjectDto);
  }


  @Get('get-capital-goods/all')
  getAllEoltSoldProductsData(  @Query('page') page: number,
  @Query('limit') limit: number,@Query('projectId') projectId: number,@Query('unitId') unitId: number): Promise<any> {
    return this.service.getAllEoltSoldProductsData(  {
      limit: limit,
      page: page,
    },projectId,unitId);
  }
  @Get(':id')
  findOne(@Param('id') id: string): Promise<CapitalGoodsActivityData> {
    return this.service.findOne(+id);
  }

  @Patch('ghg/:id')
  updateAll(@Param('id') id: number, @Body() updateProjectDto: CapitalGoodsActivityDataDto) {
     return this.service.update(+id, updateProjectDto);
  }


  @Get('ghgh/getEntryById')
  async getEntryById(@Query("eid") eid: string): Promise<CapitalGoodsActivityDataDto> {
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
