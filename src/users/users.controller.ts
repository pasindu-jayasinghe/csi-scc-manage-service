import {Body, Controller, Get, InternalServerErrorException, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {Crud,CrudController} from '@nestjsx/crud';
import { LoginRole } from 'src/auth/constants';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthService } from 'src/auth/service/auth.service';
import { RecordStatus } from 'src/shared/entities/base.tracking.entity';
import { UnitService } from 'src/unit/unit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ExportUserDto } from './dto/export.dto';

import { UserWithLoginProfileDto } from './dto/user-with-login-profile.dto';

import { User } from './user.entity';
import { UsersService } from './users.service';
import { diskStorage } from 'multer';
import { editFileName } from 'src/utills/file-upload.utils';

@Crud({
  model: {
    type: User,
  },
  query: {
    join: {    
      unit: {
        eager: true //this must be true
      }
    },

    // this works
    // filter: {
    //   id: {
    //     $eq: 1,
    //   }
    // }
  },
})
@UseGuards(JwtAuthGuard)
// @Roles(LoginRole.AUDITOR)
@Controller('users')
export class UsersController implements CrudController<User> {
  constructor(
    public service: UsersService,
    private unitService: UnitService,
    private authService: AuthService
  ) {}

  get base(): CrudController<User> {
    return this;
  }

  @Get('users-by-role')
  async getUsersByRole(@Query('unitId') unitId: string, @Query('role') role: LoginRole ):Promise<User[]>{
    const users = await this.service.find({unit:{id: parseInt(unitId)}, status: RecordStatus.Active});
    let userList = [];
    await Promise.all(users.map(async u => {
      const loginProfile = await this.authService.getLoginProfile(u.loginProfile);
      if(loginProfile.data && loginProfile.data.roles){
        let codes =loginProfile.data.roles.map((r: { code: any; }) => r.code as LoginRole);
        if(codes.length == 1 && codes[0] === role){
          userList.push(u);
        }
      }
    }))
    return userList;
  }

  @Get('/with-login-profile')
  async getUserDetailsWithLoginProfile(@Query('id') id: number): Promise<UserWithLoginProfileDto>{
    try{
      const user = await this.service.findOne(id);
      const loginProfile = await this.authService.getLoginProfile(user.loginProfile);
      const res = new UserWithLoginProfileDto();
      res.user = user;
      res.roles = loginProfile.data.roles.map((r: { code: any; }) => r.code),
      res.userName = loginProfile.data.userName;     
      res.profileState = loginProfile.data.profileState;
      return res;
    }catch(err){
      throw new InternalServerErrorException(err);
    }
  }


  @Post('/add-master-admin')
  async addMasterAdmin(@Body() dto: CreateUserDto){

    try{
      let users = await this.service.find({email: dto.email});
      if(users.length === 0 ){
        const u = new User();
        u.email = dto.email;
        u.firstName = "Master";
        u.lastName = "Admin";
        u.loginProfile = dto.loginProfile;
        u.telephone="";
    
        const mas =await this.unitService.find({name: "ClimateSI Unit"});
        if(mas.length > 0){
          u.unit = mas[0];
          await this.service.adduser(u);
        }

        return "Master admin is saved"
      }      
      else{
        const u = users[0];
        u.email = dto.email;
        u.firstName = "Master";
        u.lastName = "Admin";
        u.loginProfile = dto.loginProfile;
        u.telephone="";
        await this.service.updateuser(u);
        return "Master admin is updated";
      }      
    }catch(err){
      return "Failed to add master admin";
    }
  }

  @Get('/unit-by-email')
  async getUnitByEmail(@Query('email') email: string){
    let d= await this.service.getUnitByUserName(email)
    return d;
  }

  @Get('/get-user-by-email')
  async getUserByEmail(@Query('email') email: string){
    let d= await this.service.getUserByEmail(email)
    return d;
  }

  @Get('/get-allowed-units-by-email')
  async getAllowedUnits(@Query('email') email: string): Promise<any>{
    let d= await this.service.getAllowedUnits(email)
    return d;
  }

  @Get('/get-allowed-projects-by-email')
  async getAllowedFPProjects(@Query('email') email: string): Promise<any>{
    let d= await this.service.getAllowedFPProjects(email)
    return d;
  }

  @Get('get-users-count')
  getUsersCount(@Query('unitId') unitId?: string ){
    return this.service.getUsersCount(unitId)
  }


  @Get('export-users')
  async exportUsers(@Query('unitId') unitId: string, @Query('isAll') isAllChilds: string ):Promise<ExportUserDto>{
    return await this.service.exportUsers(parseInt(unitId), isAllChilds)
  }

  @Post('import-users')
  // @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors( FileInterceptor('file',{ storage: diskStorage({destination: './public/excel/import-users',filename: editFileName})}),)
  async addFromExcel(@UploadedFile() file: Express.Multer.File) {
    let res = await this.service.importUsers(file.buffer);
    return res
  }



  @Patch('add-allowed-unit')
  async addAllowedUnits(
    @Query('email') email: string, 
    @Query('unitIds') unitIds: number[]
  ){
    try{
      return await this.service.saveAllowedUnits(email, unitIds);      
    }catch(err){
      console.log(err);
      throw new InternalServerErrorException(err);
    }
  }


  @Patch('add-allowed-fp-projects')
  async saveAllowedFPProjects(
    @Query('email') email: string, 
    @Query('projectIds') projectIds: number[]
  ){
    try{
      return await this.service.saveAllowedFPProjects(email, projectIds);      
    }catch(err){
      console.log(err);
      throw new InternalServerErrorException(err);
    }
  }

}


// aptionValue="code"