import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, UseGuards, Query } from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { Unit } from './entities/unit.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UnitStatus } from './enum/unit-status.enum';
import { ConsecutiveYears } from './dto/consecutive-year.dto';
import { ParentChildCountDto } from './dto/dashboard.dto';
import { ByUnitIdsDto } from 'src/project/dto/by-units-req.dto';
import { UnitDetails } from './entities/unit-details.entity';
import { diskStorage } from 'multer';
import { editFileName } from 'src/utills/file-upload.utils';


@Crud({
  model: {
    type: Unit,
  },
  query: {
    join: {
      parentUnit: {
        eager: true,
      },
      childUnits: {
        eager: true,
      },
      // level: {
      //   eager: true,
      // },
      country: {
        eager: true,
      },
      industry: {
        eager: true,
      },
    },

  },
})
@UseGuards(JwtAuthGuard)
@Controller('unit')
export class UnitController implements CrudController<Unit>{
  constructor(public service: UnitService) {}


  @Post()
  create(@Body() createUnitDto: Unit): Promise<Unit>{
    return this.service.create(createUnitDto);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.service.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
  //   return this.service.update(+id, updateUnitDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.service.remove(+id);
  // }

  @Post('add-from-excell')
  // @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors( FileInterceptor('file',{ storage: diskStorage({destination: './public//herichy',filename: editFileName})}),)
  addFromExcel(@UploadedFile() file: Express.Multer.File) {
    return this.service.addFromExcel(file.buffer);
  }


  get base(): CrudController<Unit> {
    return this;
  }

  @Patch('changeStatus')
  changeStatus( @Query('id') id:number, @Query('status') status:UnitStatus): Promise<Unit> {
    return this.service.chnageStatus(id,status);
  }


  @Patch('changeStatus-all-child-units')
  changeStatusOfAll( @Query('parentUnitId') parentUnitId:number, @Query('status') status:UnitStatus): Promise<Unit> {
    return this.service.chnageStatus(parentUnitId,status, true);
  }

  @Get('get-consecutive-years')
  async getConsecutiveYears(
     @Query('unitId') unitId:number,  
     @Query('projectTypeId') projectTypeId: number
    ): Promise<ConsecutiveYears>{
    return await this.service.getConsecutiveYears(unitId, projectTypeId);
  }

  @Get('get-parent-child-count')
  async getParentChildUnits(@Query('unitId') unitId? :number):Promise<ParentChildCountDto>{
    return await this.service.getParentChildUnits(unitId)
  }

  @Get('get-get-child-units')
  async getChildUnits(@Query('unitId') unitId? :number):Promise<Unit[]>{
    return await this.service.getChildUnits(unitId)
  }

  @Get('get-get-child-unit-ids')
  async getChildUnitIds(@Query('unitId') unitId? :number):Promise<number[]>{
    console.log("uuuuu",unitId)

    let cccc =  (await this.service.getChildUnits(unitId)).map(u => u.id)

    console.log("ss0",cccc)
    return (await this.service.getChildUnits(unitId)).map(u => u.id);
  }


  @Post('get-units-with-parent')
  async getUnitsWithParent(@Body() req: ByUnitIdsDto):Promise<Unit[]>{
    return await this.service.getUnitsWithParent(req.unitIds)
  }


  // @Post('get-xx')
  // async getUnitsDetailsIds(@Body() req: ByUnitIdsDto):Promise<UnitDetails[]>{
  //   return await this.service.getUnitsDetailsIds(req.unitIds)
  // }

}
