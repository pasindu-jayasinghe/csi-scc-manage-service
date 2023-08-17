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
import { NetZeroEmployeeCommutingActivityData } from '../entities/net-zero-employee-commuting.entity';
import { NetZeroEmployeeCommutingService } from '../service/net-zero-employee-commuting.service';
import { NetZeroEmployeeCommutingActivityDataDto } from '../dto/net-zero-employee-commuting-dto.dto';
import { ApiTags } from '@nestjs/swagger';
import { NetZeroDeletable } from 'src/emission/net-zero-deletbale';
  
  @Crud({
    model: {
      type: NetZeroEmployeeCommutingActivityData,
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
  @ApiTags('Net Zero Employee Commuting')
  // @UseGuards(JwtAuthGuard)
  @Controller('net_zero_employee_commuting')
  export class NetZeroEmployeeCommutingActivityDataController implements CrudController<NetZeroEmployeeCommutingActivityData>,NetZeroDeletable {
    constructor(
      public service: NetZeroEmployeeCommutingService,
      @InjectRepository(NetZeroEmployeeCommutingActivityData)
      private readonly elecRepository: Repository<NetZeroEmployeeCommutingActivityData>,
    ) {}
  
    get base(): CrudController<NetZeroEmployeeCommutingActivityData> {
      return this;
    }
  
    // @Post()
    // create(@Body() createProjectDto: NetZeroBusinessTravelActivityData): Promise<NetZeroBusinessTravelActivityData> {
    //   return this.service.create(createProjectDto);
    // }

    @Post('save')
    createOne(@Body() createProjectDto: NetZeroEmployeeCommutingActivityDataDto): Promise<NetZeroEmployeeCommutingActivityData> {
      console.log(createProjectDto)

      return this.service.createALLNetZeroEmployeeCommuting(createProjectDto);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string): Promise<NetZeroEmployeeCommutingActivityData> {
      const crypto = require('crypto');
      const groupNumber=crypto.randomUUID();
      console.log(groupNumber)
      return this.service.findOne(+id);
    }
    @Get('getEmployeeCommutingData/all')
    getAllEmployeeCommutingData(  @Query('page') page: number,
    @Query('limit') limit: number,@Query('projectId') projectId: number,@Query('unitId') unitId: number): Promise<any> {
      // console.log("groupNumber")
      return this.service.getAllEmployeeCommutingData(  {
        limit: limit,
        page: page,
      },projectId,unitId);
    }
    // @Patch(':id')
    // update(@Param('id') id: string, @Body() updateProjectDto: NetZeroEmployeeCommutingActivityData) {
    //   return this.service.update(+id, updateProjectDto);
    // }
    
    @Get('getOneEmployeeCommutingData/groupNumberSet')
    getOneEmployeeCommutingDataSet(@Query('groupNumber') groupNumber: string ): Promise<any> {
      console.log(groupNumber)
      return this.service.getOneEmployeeCommutingDataSet( 
        groupNumber);
    }

  //  @Delete('deleteWholeGroup')
  //   async deleteWholeGroup(
  //     @Body() ids: number[]
  //   ) {
  //     console.log("groupNumber",ids)
      
  //     return await this.service.deleteWholeGroup(ids);
  //   }

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
  