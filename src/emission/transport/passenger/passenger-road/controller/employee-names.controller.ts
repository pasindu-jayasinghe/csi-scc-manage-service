import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {  Crud, CrudController} from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EmployeeName } from '../entities/employee-names.entity';
import { EmployeeNameService } from '../service/employee-names.service';


@Crud({
  model: {
    type: EmployeeName,
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
@Controller('employee-name')
export class EmployeeNameController implements CrudController<EmployeeName>{
  constructor(public service: EmployeeNameService){}

    get base(): CrudController<EmployeeName> {
      return this;
    }
  

    @Post()
    create(@Body() dto: EmployeeName) {
      return this.service.create(dto);
    }



 
  
 
}
