import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EmployeeName } from '../entities/employee-names.entity';

@Injectable()
export class EmployeeNameService extends TypeOrmCrudService<EmployeeName>{

  constructor(@InjectRepository(EmployeeName) repo) {
    super(repo);
  }


  async create(dto:EmployeeName){
    console.log("dd",dto)
       
    try{      

      let emp = await this.repo.find({ code: dto.code,empId:dto.empId});       

      if (emp.length > 0) {
        let err = new BadRequestException("Employee is already Exist", "Employee is already saved");
        
        return err
      }else{ 
          return this.repo.save(dto);

      }

  }catch(err){
    console.log(err);
    return null;
  }

  }


}
