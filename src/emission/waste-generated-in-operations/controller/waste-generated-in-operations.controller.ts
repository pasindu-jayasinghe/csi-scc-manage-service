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
import { WasteGeneratedInOperationsActivityDataDto } from '../dto/waste-generated-in-operations-dto.dto';
import { WasteGeneratedInOperationsActivityData } from '../entities/waste-generated-in-operations.entity';
import { WasteGeneratedInOperationsService } from '../service/waste-generated-in-operations.service';
import { NetZeroDeletable } from 'src/emission/net-zero-deletbale';
  
  @Crud({
    model: {
      type: WasteGeneratedInOperationsActivityData,
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
  export class WasteGeneratedInOperationsActivityDataController implements CrudController<WasteGeneratedInOperationsActivityData>,NetZeroDeletable {
    constructor(
      public service: WasteGeneratedInOperationsService,
      @InjectRepository(WasteGeneratedInOperationsActivityData)
      private readonly elecRepository: Repository<WasteGeneratedInOperationsActivityData>,
    ) {}
  
    get base(): CrudController<WasteGeneratedInOperationsActivityData> {
      return this;
    }
  
    // @Post()
    // create(@Body() createProjectDto: NetZeroBusinessTravelActivityData): Promise<NetZeroBusinessTravelActivityData> {
    //   return this.service.create(createProjectDto);
    // }

    @Post('waste/save')
    createOne(@Body() createProjectDto: WasteGeneratedInOperationsActivityDataDto): Promise<WasteGeneratedInOperationsActivityData> {
      console.log(createProjectDto)

      return this.service.createALLWasteGeneratedInOperations(createProjectDto);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string): Promise<WasteGeneratedInOperationsActivityData> {
      const crypto = require('crypto');
      const groupNumber=crypto.randomUUID();
      console.log(groupNumber)
      return this.service.findOne(+id);
    }
    @Get('waste/getWasteGeneratedInOperationsData/all')
    getAllWasteGeneratedInOperationsData(  @Query('page') page: number,
    @Query('limit') limit: number,@Query('projectId') projectId: number,@Query('unitId') unitId: number): Promise<any> {
      // console.log("groupNumber")
      return this.service.getAllWasteGeneratedInOperationsData(  {
        limit: limit,
        page: page,
      },projectId,unitId);
    }
    // @Patch(':id')
    // update(@Param('id') id: string, @Body() updateProjectDto: WasteGeneratedInOperationsActivityData) {
    //   return this.service.update(+id, updateProjectDto);
    // }
    
    @Get('waste/getOneWasteGeneratedInOperationsData/groupNumberSet')
    getOneWasteGeneratedInOperationsDataSet(@Query('groupNumber') groupNumber: string ): Promise<any> {
      console.log(groupNumber)
      return this.service.getOneWasteGeneratedInOperationsDataSet( 
        groupNumber);
    }

  //  @Delete('deleteWholeGroup')
  //   async deleteWholeGroup(
  //     @Body() ids: number[]
  //   ) {
  //     console.log("groupNumber",ids)
      
  //     return await this.service.deleteWholeGroup(ids);
  //   }

    @Delete('waste/deleteWholeGroup')
    async deleteWholeGroup(
      @Query('groupNumber') groupNumber: string
    ) {
      console.log("groupNumber",groupNumber)
      
      return await this.service.deleteWholeGroup(groupNumber);
    }
    @Delete('waste/deleteSelectedALL')
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
    @Delete('waste/deleteOneRow')
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
  