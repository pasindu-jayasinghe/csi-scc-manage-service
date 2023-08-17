import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UploadedFile, UseInterceptors, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';


import { EmissionBaseService } from './emission-base.service';
import multer = require('multer')
import * as fs from 'fs'
import * as XLSX from 'xlsx';
import { sourceName } from './enum/sourcename.enum';
import { ManyActivityDataDto } from './dto/many-activity-data.dto';
import { BulckCalculatio } from './dto/bulck-calculatio.dto';
import { BulckDeletDto } from './dto/bulck-delete.dto';
import { ValidationSheetMapDto } from './dto/validation.sheet.map.dto';
import { ProgressDetailDto } from './emission-source/dto/progress-detail.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ActivityDataDownloadDto } from './emission-source/dto/activity-data-download.dto';
import { diskStorage } from 'multer';
import { editFileName } from 'src/utills/file-upload.utils';

const storage = multer.diskStorage({
  destination: "public/tmp",
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  }
});


@UseGuards(JwtAuthGuard)
@Controller('emission-base')
export class EmissionBaseController {
  constructor(
    private emissionBaseService: EmissionBaseService,
  ) {}


  @Post('add-from-excell')
  @UseInterceptors(FileInterceptor('file'))
  addFromExcel(@UploadedFile() file: Express.Multer.File,
   @Query('projectId') projectId: number,  
   @Query('esId') esId: number,
   @Query('unitId') unitId: number,  
   @Query('userId') userId: number
  ) {
    return this.emissionBaseService.addFromExcell(projectId, esId, file.buffer, userId, unitId);
  }


  @Post('bulk-delete')
  bulkDelete( @Body() req: BulckDeletDto) {
    return this.emissionBaseService.bulkDelete(req)
  }


  @Post('get-variable-mapping')
  getVariableMapping(  
   @Query('esCode') esCode: string,
  ) {
    return this.emissionBaseService.getVariableMapping(esCode)
  }

  @Post('upload-bulk-multi-unit')
  // @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors( FileInterceptor('file',),)  // { storage: diskStorage({destination: './public/excel/upload-bulk-multi-unit',filename: editFileName})}
  async uploadBulkMultiUnit(@UploadedFile() file: Express.Multer.File,
   @Query('projectId') projectId: number,  
   @Query('esCode') esCode: sourceName,
   @Query('userId') userId: number,
   @Body() body: any,
  ): Promise<any> {


    // this.appService.saveFile(file,'cddscsd');
    // return null;
    let mappingJSON = JSON.parse(body.mapping);
    let mapping = mappingJSON["data"] as ValidationSheetMapDto[]

    let res =  await this.emissionBaseService.uploadBulkMultipleUnit(projectId,esCode,file.buffer,userId, mapping)
    return res;

  }



  @Post('upload-bulk')
  // @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors( FileInterceptor('file',{ storage: diskStorage({destination: './public/excel/upload-bulk',filename: editFileName})}),)
  uploadBulk(@UploadedFile() file: Express.Multer.File,
   @Query('projectId') projectId: number,  
   @Query('esCode') esCode: sourceName,
   @Query('unitId') unitId: number,  
   @Query('userId') userId: number,
   @Query('ownerShip') ownerShip: string,  
   @Query('isMobile') isMobile: string,
  ) {
    return this.emissionBaseService.uploadBulk(projectId, esCode, file.buffer, userId, unitId, ownerShip,isMobile == 'true');
  }




  @Post('upload-airports')
  @UseInterceptors(FileInterceptor('file'))
  uploadAirports(@UploadedFile() file: Express.Multer.File
  ) {
    let workbook = XLSX.read(file.buffer)
    let sheet = workbook.Sheets['Sheet1'] 
    let data = XLSX.utils.sheet_to_json(sheet)
    fs.writeFile('public/tmp/airports.json', JSON.stringify(data), err => {
      if (err) {
          console.log('Error writing file', err)
      } else {
          console.log('Successfully wrote file')
      }
    })
  }
  @Get('update-total')
  async updateTotal(
    @Query('projectId') projectId: number,  
    @Query('unitId') unitId: number,  
  ){
    return await this.emissionBaseService.updateTotal(projectId,unitId);
  }

  @Post('get-many-activity-data')
  async getManyActivityData(
    @Body() req: ManyActivityDataDto
  ){
    try{
      return await this.emissionBaseService.getManyActivityData(req.projectId,req.unitIds, req.userIds, req.es);
    }catch(err){
      console.log("getManyActivityData ",err);
      throw new InternalServerErrorException();
    }
  }

  @Post('bulk-recalculate')
  async bulkRecalculate(
    @Body() req: BulckCalculatio
  ): Promise<any>{
    try{
      return await this.emissionBaseService.bulkRecalculate(req.projectId,req.unitIds, req.esList);
    }catch(err){
      console.log("bulkRecalculate ",err);
      throw new InternalServerErrorException();
    }
  }


  @Post('get-many-activity-data-for-es-list')
  async getManyActivityDataForEsList(
    @Body() req: ManyActivityDataDto
  ){
    try{
      return await Promise.all(req.esList.map(async es => {
        let data = await this.emissionBaseService.getManyActivityData(req.projectId,req.unitIds, req.userIds, es);
        return {
          es: es,
          data: data
        }
      }))
    }catch(err){
      console.log("getManyActivityDataForEsList " , err);
      throw new InternalServerErrorException();
    }
    
  }


  @Get('env')
  getEnv(){
    return (process.env.DB)
  }

  @Get('validate-month')
  async validateMonth(
    @Query('source') source: sourceName,
    @Query('projectId') projectId: number,
    @Query('unitId') unitId: number,
    @Query('year') year: string,
    @Query('month') month: number,

  ){
    return await this.emissionBaseService.validateMonth(source, projectId, unitId, year, month)
  }


  @Get('progress-data')
  async getProgressData(
    @Query('projectId') projectId: number,
    @Query('unitId') unitId: number
  ):Promise<any>{
    try{
      return await this.emissionBaseService.getProgressData(projectId, unitId);
    }catch(err){
      console.log("getProgressData ",err);
      throw new InternalServerErrorException();
    }
  }

  @Post('progress-detail')
  async modifyActivityData(@Body() req: ProgressDetailDto): Promise<any> {
    return await this.emissionBaseService.modifyActivityData(req.projectId, req.unitId, req.esCode, req.parameters)
  }

  @Post('progress-detail-es')
  async generateActivityData(@Body() req: ProgressDetailDto): Promise<any> {
    return await this.emissionBaseService.generateActiviyData(req.projectId, req.unitId, req.esCode, req.parameters)
  }

  @Post('download-ac-data')
  async downloadActivityData (@Body() req: ActivityDataDownloadDto): Promise<any> {
    return await this.emissionBaseService.downloadActivityData(req.projectId, req.esCode, req.optional)
  }



}
