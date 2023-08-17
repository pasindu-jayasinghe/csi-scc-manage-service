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
import { NetZeroBusinessTravelActivityData } from '../entities/net-zero-business-travel.entity';
import { NetZeroBusinessTravelService } from '../service/net-zero-business-travel.service';
import { NetZeroBusinessTravelActivityDataDto } from '../dto/net-zero-business-travel-dto.dto';
import { ApiTags } from '@nestjs/swagger';
import { NetZeroDeletable } from 'src/emission/net-zero-deletbale';
  
  @Crud({
    model: {
      type: NetZeroBusinessTravelActivityData,
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
  @ApiTags('Net Zero Business Travel')
  // @UseGuards(JwtAuthGuard)
  @Controller('net_zero_business_travel')
  export class NetZeroBusinessTravelActivityDataController implements CrudController<NetZeroBusinessTravelActivityData>,NetZeroDeletable {
    constructor(
      public service: NetZeroBusinessTravelService,
      @InjectRepository(NetZeroBusinessTravelActivityData)
      private readonly elecRepository: Repository<NetZeroBusinessTravelActivityData>,
    ) {}
  
    get base(): CrudController<NetZeroBusinessTravelActivityData> {
      return this;
    }
  
    // @Post()
    // create(@Body() createProjectDto: NetZeroBusinessTravelActivityData): Promise<NetZeroBusinessTravelActivityData> {
    //   return this.service.create(createProjectDto);
    // }

    @Post('save')
    createOne(@Body() createProjectDto: NetZeroBusinessTravelActivityDataDto): Promise<NetZeroBusinessTravelActivityData> {
      console.log(createProjectDto)

      return this.service.createALLNetZeroBusinessTravel(createProjectDto);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string): Promise<NetZeroBusinessTravelActivityData> {
      const crypto = require('crypto');
      const groupNumber=crypto.randomUUID();
      console.log(groupNumber)
      return this.service.findOne(+id);
    }
    @Get('getBussinesTravelData/all')
    getAllBussinesTravelData(  @Query('page') page: number,
    @Query('limit') limit: number,@Query('projectId') projectId: number,@Query('unitId') unitId: number): Promise<any> {
      // console.log("groupNumber")
      return this.service.getAllBussinesTravelData(  {
        limit: limit,
        page: page,
      },projectId,unitId);
    }
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProjectDto: NetZeroBusinessTravelActivityData) {
      // return this.service.update(+id, updateProjectDto);
    }
    
    @Get('getOneBussinesTravelData/groupNumberSet')
    getOneBussinesTravelDataSet(@Query('groupNumber') groupNumber: string ): Promise<any> {
      console.log(groupNumber)
      return this.service.getOneBussinesTravelDataSet( 
        groupNumber);
    }

   @Delete('deleteWholeGroup')
    async deleteWholeGroup(
      @Query('groupNumber') groupNumber: string
    ) {
      console.log("groupNumber",groupNumber)
      
      return await this.service.deleteWholeGroup(groupNumber);
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

    @Delete('deleteOneRow')
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
  