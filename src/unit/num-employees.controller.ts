import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { NumEmployeesService } from './num-employees.service';
import { NumEmployee } from './entities/num-employee.entity';
import { Crud, CrudController } from '@nestjsx/crud';
import { ByUnitIdsDto } from 'src/project/dto/by-units-req.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { editFileName } from 'src/utills/file-upload.utils';

@Crud({
  model: {
    type: NumEmployee,
  },
  query: {
    join: {
      unitDetail: {
        eager: true
      }
    }
  },
})
@UseGuards(JwtAuthGuard)
@Controller('num-employees')
export class NumEmployeesController implements CrudController<NumEmployee>{
  constructor(public service: NumEmployeesService) {}

  get base(): CrudController<NumEmployee> {
    return this;
  }

  @Post('get-total-employees')
  async getTotalEmployees( @Query('projectId') projectId: number){
    console.log("projectId--",projectId)
    return await this.service.getTotalEmployees(projectId)
  }


  @Post('upload-bulk-unit-employee')
  // @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors( FileInterceptor('file',{ storage: diskStorage({destination: './public/excel/upload-bulk-unit-employee',filename: editFileName})}),)
  uploadBulkUnitEmployee(@UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadBulk(file.buffer);
  }


  @Post('get-variable-mapping-employee-num')
  getVariableMapping(  
  ) {
    return this.service.getVariableMapping()
  }


}
