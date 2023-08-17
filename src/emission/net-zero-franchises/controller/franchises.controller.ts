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
import { FranchisesActivityData } from '../entities/franchises.entity';
import { FranchisesService } from '../service/franchises.service';
import { FranchisesActivityDataDto } from '../dto/franchises-dto.dto';
import { ApiTags } from '@nestjs/swagger';

@Crud({
  model: {
    type: FranchisesActivityData,
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
// @ApiTags('Franchises')
// @UseGuards(JwtAuthGuard)
@Controller('franchises')
export class FranchisesActivityDataController implements CrudController<FranchisesActivityData> {
  constructor(
    public service: FranchisesService,
    @InjectRepository(FranchisesActivityData)
    private readonly elecRepository: Repository<FranchisesActivityData>,
  ) { }

  get base(): CrudController<FranchisesActivityData> {
    return this;
  }

  @Post('save')
  createOne(@Body() createProjectDto: FranchisesActivityDataDto): Promise<boolean> {
    return this.service.createAllFranchises(createProjectDto);
  }


  @Get('get-all-franchises-data')
  getAllFranchisesData(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('projectId') projectId: number,
    @Query('unitId') unitId: number
  ): Promise<any> {

    try {
      return this.service.getAllFranchisesData({ limit: limit, page: page, }, projectId, unitId);
    } catch (e) {
      console.log(e)
      throw new InternalServerErrorException(e);
    }
  }

  @Get('get-one-franchises-data/group-number-set')
  getOneFranchisesDataSet(@Query('groupNumber') groupNumber: string): Promise<any> {
    return this.service.getOneFranchisesDataSet(groupNumber);
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


  @Delete('deleteSelectedALL')
  async deleteSelectedALL(
    @Query('groupNumber') groupNumbers: string[]
  ) {
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
