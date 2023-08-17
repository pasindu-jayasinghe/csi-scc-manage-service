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
import { FuelEnergyRelatedActivitiesActivityData } from '../entities/fuel_energy_related_activities.entity';
import { FuelEnergyRelatedActivitiesService } from '../service/fuel_energy_related_activities.service';
import { FuelEnergyRelatedActivitiesActivityDataDto } from '../dro/fuel_energy_related_activities.dto';

@Crud({
  model: {
    type: FuelEnergyRelatedActivitiesActivityData,
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
//FuelEnergyRelatedActivitiesActivityData
// @ApiTags('Invest')
// @UseGuards(JwtAuthGuard)
@Controller('fuelandenergy')
export class FuelEnergyRelatedActivitiesActivityDataController implements CrudController<FuelEnergyRelatedActivitiesActivityData> {
  constructor(
    public service: FuelEnergyRelatedActivitiesService,
    @InjectRepository(FuelEnergyRelatedActivitiesActivityData)
    private readonly elecRepository: Repository<FuelEnergyRelatedActivitiesActivityData>,
  ) {}

  get base(): CrudController<FuelEnergyRelatedActivitiesActivityData> {
    return this;
  }

  @Post('saveFuelAndEnergy')
  createAll(@Body() createProjectDto: FuelEnergyRelatedActivitiesActivityDataDto): Promise<FuelEnergyRelatedActivitiesActivityData> {
    return this.service.createAll(createProjectDto);
  }


  @Get('getfuelenergyactivitytData/all')
  getAllFuelEnergyData(  @Query('page') page: number,
  @Query('limit') limit: number,@Query('projectId') projectId: number,@Query('unitId') unitId: number): Promise<any> {
    return this.service.getAllFuelEnergyData(  {
      limit: limit,
      page: page,
    },projectId,unitId);
  }
  @Get(':id')
  findOne(@Param('id') id: string): Promise<FuelEnergyRelatedActivitiesActivityData> {
    return this.service.findOne(+id);
  }

  @Patch('ghg/:id')
  updateAll(@Param('id') id: number, @Body() updateProjectDto: FuelEnergyRelatedActivitiesActivityDataDto) {
     return this.service.update(+id, updateProjectDto);
  }


  @Get('ghg/getEntryById')
  async getEntryById(@Query("eid") eid: string): Promise<FuelEnergyRelatedActivitiesActivityDataDto> {
    return await this.service.getEntryById(eid);
  }


  @Post('ghg/:eid')
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
