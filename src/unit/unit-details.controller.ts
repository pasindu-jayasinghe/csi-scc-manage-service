import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';

import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { Unit } from './entities/unit.entity';
import { Level } from './entities/level.entity';
import { LevelService } from './level.service';
import { diskStorage } from 'multer';

import { UnitDetails } from './entities/unit-details.entity';
import { UnitDetailsService } from './unit-details.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { editFileName } from 'src/utills/file-upload.utils';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';


@Crud({
  model: {
    type: UnitDetails,
  },
  query: {
    join: {
        unit: {
            eager: true,
          },
    
    },

  },
})
@UseGuards(JwtAuthGuard)
@Controller('unit-details')
export class UnitDetailsController implements CrudController<UnitDetails>{
  constructor(public service: UnitDetailsService) {}





  @Post('upload-img/:uid')
  @UseInterceptors( FileInterceptor('file',{ storage: diskStorage({destination: './public',filename: editFileName})}),)
  async uploadFileImg(@UploadedFile() file: Express.Multer.File, @Param('uid') uid,) {

    const newSavedfile = file.filename;
    return this.service.filePathSave(newSavedfile,uid);

    //console.log(file);
  }
  

}
