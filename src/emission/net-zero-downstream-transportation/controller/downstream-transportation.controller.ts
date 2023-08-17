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
import { DownstreamTransportationActivityData } from '../entities/downstream-transportation.entity';
import { DownstreamTransportationService } from '../service/downstream-transportation.service';
import { DownstreamTransportationActivityDataDto } from '../dto/downstream-transportation-dto.dto';
import { ApiTags } from '@nestjs/swagger';

@Crud({
  model: {
    type: DownstreamTransportationActivityData,
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
// @ApiTags('DownstreamTransportation')
// @UseGuards(JwtAuthGuard)
@Controller('downstream-transportation')
export class DownstreamTransportationActivityDataController implements CrudController<DownstreamTransportationActivityData> {
  constructor(
    public service: DownstreamTransportationService,
    @InjectRepository(DownstreamTransportationActivityData)
    private readonly elecRepository: Repository<DownstreamTransportationActivityData>,
  ) { }

  get base(): CrudController<DownstreamTransportationActivityData> {
    return this;
  }

  @Post('save')
  createOne(@Body() createProjectDto: DownstreamTransportationActivityDataDto): Promise<boolean> {
    return this.service.createAllDownstreamTransportation(createProjectDto);
  }


  @Get('get-all-downstream-transportation-data')
  getAllDownstreamTransportationData(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('projectId') projectId: number,
    @Query('unitId') unitId: number
  ): Promise<any> {

    try {
      return this.service.getAllDownstreamTransportationData({ limit: limit, page: page, }, projectId, unitId);
    } catch (e) {
      console.log(e)
      throw new InternalServerErrorException(e);
    }
  }

  @Get('get-one-downstream-transportation-data/group-number-set')
  getOneDownstreamTransportationDataSet(@Query('groupNumber') groupNumber: string): Promise<any> {
    return this.service.getOneDownstreamTransportationDataSet(groupNumber);
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
