import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  InternalServerErrorException,
} from '@nestjs/common';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpstreamTransportationActivityData } from '../entities/upstream-transportation.entity';
import { UpstreamTransportationService } from '../service/upstream-transportation.service';
import { UpstreamTransportationActivityDataDto } from '../dto/upstream-transportation-dto.dto';
import { ApiTags } from '@nestjs/swagger';

@Crud({
  model: {
    type: UpstreamTransportationActivityData,
  },
  query: {
    join: {
      project: {
        eager: true,
      },
      unit: {
        eager: true,
      },
      user: {
        eager: true,
      }
    },
  },
})
// @ApiTags('UpstreamTransportation')
// @UseGuards(JwtAuthGuard)
@Controller('upstream-transportation')
export class UpstreamTransportationActivityDataController implements CrudController<UpstreamTransportationActivityData> {
  constructor(
    public service: UpstreamTransportationService,
    @InjectRepository(UpstreamTransportationActivityData)
    private readonly elecRepository: Repository<UpstreamTransportationActivityData>,
  ) { }

  get base(): CrudController<UpstreamTransportationActivityData> {
    return this;
  }

  @Post('save')
  createOne(@Body() createProjectDto: UpstreamTransportationActivityDataDto): Promise<boolean> {
    return this.service.createAllUpstreamTransportation(createProjectDto);
  }


  @Get('get-all-upstream-transportation-data')
  getAllUpstreamTransportationData(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('projectId') projectId: number,
    @Query('unitId') unitId: number
  ): Promise<any> {

    try {
      return this.service.getAllUpstreamTransportationData({ limit: limit, page: page, }, projectId, unitId);
    } catch (e) {
      console.log(e)
      throw new InternalServerErrorException(e);
    }
  }

  @Get('get-one-upstream-transportation-data/group-number-set')
  getOneUpstreamTransportationDataSet(@Query('groupNumber') groupNumber: string): Promise<any> {
    return this.service.getOneUpstreamTransportationDataSet(groupNumber);
  }

  @Delete('delete-whole-group')
  async deleteWholeGroup(@Query('groupNumber') groupNumber: string) {
    return await this.service.deleteWholeGroup(groupNumber);
  }

  @Delete('deleteOneRow')
  async deleteOneRow(@Query('id') id: number) {
    return await this.service.removeOneRow(id);
  }

  async deleteOne(@ParsedRequest() req: CrudRequest) {
    return await this.service.remove(req)
  }
}
