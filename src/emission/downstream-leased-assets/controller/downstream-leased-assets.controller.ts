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
  } from '@nestjs/common';
  import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
  
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { ApiTags } from '@nestjs/swagger';

import { NetZeroDeletable } from 'src/emission/net-zero-deletbale';
import { DownstreamLeasedAssetsActivityDataDto } from '../dto/downstream-leased-assets-dto.dto';
import { DownstreamLeasedAssetsActivityData } from '../entities/downstream-leased-assets.entity';
import { DownstreamLeasedAssetsService } from '../service/downstream-leased-assets.service';
  
  @Crud({
    model: {
      type: DownstreamLeasedAssetsActivityData,
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
  @ApiTags('Waste Generated In Operations')
  // @UseGuards(JwtAuthGuard)
  @Controller('waste_generated_in_operations')
  export class DownstreamLeasedAssetsActivityDataController implements CrudController<DownstreamLeasedAssetsActivityData>,NetZeroDeletable {
    constructor(
      public service: DownstreamLeasedAssetsService,
      @InjectRepository(DownstreamLeasedAssetsActivityData)
      private readonly elecRepository: Repository<DownstreamLeasedAssetsActivityData>,
    ) {}
  
    get base(): CrudController<DownstreamLeasedAssetsActivityData> {
      return this;
    }
  
    // @Post()
    // create(@Body() createProjectDto: NetZeroBusinessTravelActivityData): Promise<NetZeroBusinessTravelActivityData> {
    //   return this.service.create(createProjectDto);
    // }

    @Post('save')
    createOne(@Body() createProjectDto: DownstreamLeasedAssetsActivityDataDto): Promise<DownstreamLeasedAssetsActivityData> {
      console.log(createProjectDto)

      return this.service.createALLDownstreamLeasedAssets(createProjectDto);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string): Promise<DownstreamLeasedAssetsActivityData> {
      const crypto = require('crypto');
      const groupNumber=crypto.randomUUID();
      console.log(groupNumber)
      return this.service.findOne(+id);
    }
    @Get('getDownstreamLeasedAssetsData/all')
    getAllDownstreamLeasedAssetsData(  @Query('page') page: number,
    @Query('limit') limit: number,@Query('projectId') projectId: number,@Query('unitId') unitId: number): Promise<any> {
      // console.log("groupNumber")
      return this.service.getAllDownstreamLeasedAssetsData(  {
        limit: limit,
        page: page,
      },projectId,unitId);
    }
    // @Patch(':id')
    // update(@Param('id') id: string, @Body() updateProjectDto: DownstreamLeasedAssetsActivityData) {
    //   return this.service.update(+id, updateProjectDto);
    // }
    
    @Get('getOneDownstreamLeasedAssetsData/groupNumberSet')
    getOneDownstreamLeasedAssetsDataSet(@Query('groupNumber') groupNumber: string ): Promise<any> {
      console.log(groupNumber)
      return this.service.getOneDownstreamLeasedAssetsDataSet( 
        groupNumber);
    }

  //  @Delete('deleteWholeGroup')
  //   async deleteWholeGroup(
  //     @Body() ids: number[]
  //   ) {
  //     console.log("groupNumber",ids)
      
  //     return await this.service.deleteWholeGroup(ids);
  //   }

    @Delete('/getOneDownstreamLeasedAssetsData/deleteWholeGroup')
    async deleteWholeGroup(
      @Query('groupNumber') groupNumber: string
    ) {
      console.log("groupNumber",groupNumber)
      
      return await this.service.deleteWholeGroup(groupNumber);
    }
    @Delete('getOneDownstreamLeasedAssetsData//deleteSelectedALL')
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
    @Delete('getOneDownstreamLeasedAssetsData/deleteOneRow')
    async deleteOneRow(
      @Query('id') id: number
    ) {
      // console.log("groupNumber",id)
      
      return await this.service.removeOneRow(id);
    }

    async deleteOne(
      @ParsedRequest() req: CrudRequest,
    ) {
  
      return await this.service.remove(req)
    }
  }
  