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

import { InvestmentsActivityData } from '../entities/investments.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { InvestmentsService } from '../service/investments.service';
import { InvestmentsActivityDataDto } from '../dto/investments.dto';
import { ApiTags } from '@nestjs/swagger';

@Crud({
  model: {
    type: InvestmentsActivityData,
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
@Controller('investments')
export class InvestmentsActivityDataController implements CrudController<InvestmentsActivityData> {
  constructor(
    public service: InvestmentsService,
    @InjectRepository(InvestmentsActivityData)
    private readonly elecRepository: Repository<InvestmentsActivityData>,
  ) {}

  get base(): CrudController<InvestmentsActivityData> {
    return this;
  }

  @Post('saveinvest')
  createAll(@Body() createProjectDto: InvestmentsActivityDataDto): Promise<InvestmentsActivityData> {

    return this.service.createAll(createProjectDto);
  }


  @Get('getInvestmentData/all')
  getAllInvestmentData(  @Query('page') page: number,
  @Query('limit') limit: number,@Query('projectId') projectId: number,@Query('unitId') unitId: number): Promise<any> {
    // console.log("groupNumber")
    return this.service.getAllInvestmentData(  {
      limit: limit,
      page: page,
    },projectId,unitId);
  }
  @Get(':id')
  findOne(@Param('id') id: string): Promise<InvestmentsActivityData> {
    return this.service.findOne(+id);
  }

  @Patch('ghg/:id')
  updateAll(@Param('id') id: number, @Body() updateProjectDto: InvestmentsActivityDataDto) {
     return this.service.update(+id, updateProjectDto);
  }


  @Get('ghgh/getEntryById')
  async getEntryById(@Query("eid") eid: string): Promise<InvestmentsActivityDataDto> {
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
