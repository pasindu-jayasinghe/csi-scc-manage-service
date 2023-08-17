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
import { UpstreamLeasedAssetsActivityData } from '../entities/upstream-leased-assets.entity';
import { UpstreamLeasedAssetsService } from '../service/upstream-leased-assets.service';
import { UpstreamLeasedAssetsActivityDataDto } from '../dto/upstream-leased-assets-dto.dto';

@Crud({
  model: {
    type: UpstreamLeasedAssetsActivityData,
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
@Controller('UpstreamLeasedAssets')
export class UpstreamLeasedAssetsActivityDataController implements CrudController<UpstreamLeasedAssetsActivityData> {
  constructor(
    public service: UpstreamLeasedAssetsService,
    @InjectRepository(UpstreamLeasedAssetsActivityData)
    private readonly elecRepository: Repository<UpstreamLeasedAssetsActivityData>,
  ) {}

  get base(): CrudController<UpstreamLeasedAssetsActivityData> {
    return this;
  }

  @Post('saveinvest')
  createAll(@Body() createProjectDto: UpstreamLeasedAssetsActivityDataDto): Promise<UpstreamLeasedAssetsActivityData> {

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
  findOne(@Param('id') id: string): Promise<UpstreamLeasedAssetsActivityData> {
    return this.service.findOne(+id);
  }

  @Patch('ghg/:id')
  updateAll(@Param('id') id: number, @Body() updateProjectDto: UpstreamLeasedAssetsActivityDataDto) {
     return this.service.update(+id, updateProjectDto);
  }


  @Get('ghgh/getEntryById')
  async getEntryById(@Query("eid") eid: string): Promise<UpstreamLeasedAssetsActivityDataDto> {
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
