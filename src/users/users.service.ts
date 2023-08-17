import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Unit } from 'src/unit/entities/unit.entity';
import { UnitService } from 'src/unit/unit.service';
// import Excel from 'exceljs';
import * as XLSX from 'xlsx';
import { AuthService } from 'src/auth/service/auth.service';
import { RecordStatus } from 'src/shared/entities/base.tracking.entity';
import { ExportUserDto } from './dto/export.dto';


@Injectable()
export class UsersService extends TypeOrmCrudService<User> {
  constructor(
    @InjectRepository(User) repo,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private unitService: UnitService,
    private authService: AuthService
  ) {
    super(repo);
  }

  async adduser(user: User): Promise<User>{
    return await this.repo.save(user);
  }

  async updateuser(user: User){
    return await this.repo.update(user.id, user);
  }

  async getUnitByUser(userId: number){
    let a = await this.usersRepository.createQueryBuilder('user')
    .innerJoinAndMapOne('user.unit', Unit, 'unit', 'user.unit = unit.id')
    .where('user.id= :id', {id: userId}) 
    .getOne();

    return this.unitService.findOne(a.unit);
  }

  async getAllowedUnits(userName: string){
    let user = await this.usersRepository.createQueryBuilder('user')
    .innerJoinAndMapOne('user.unit', Unit, 'unit', 'user.unit = unit.id')
    .where('user.email= :email', {email: userName}) 
    .getOne();

    let units = await this.unitService.find({id: In(user.getAllowedSelectUnits())});
    return units.map(u => {
      return {
        id: u.id, 
        name: u.name,
        perfix: u.perfix
      }
    })
  }

  async getAllowedFPProjects(userName: string){
    let user = await this.usersRepository.createQueryBuilder('user')
    .innerJoinAndMapOne('user.unit', Unit, 'unit', 'user.unit = unit.id')
    .where('user.email= :email', {email: userName}) 
    .getOne();

    let projects = await this.unitService.find({id: In(user.getAllowedFPProjects())});
    return projects.map(p => {
      return {
        id: p.id, 
        name: p.name
      }
    })
  }

  async getUserByEmail(userName: string){
    return await this.usersRepository.createQueryBuilder('user')
    .innerJoinAndMapOne('user.unit', Unit, 'unit', 'user.unit = unit.id')
    .where('user.email= :email', {email: userName}) 
    .getOne();
  }

  async getUnitByUserName(userName: string){
    let a = await this.usersRepository.createQueryBuilder('user')
    .innerJoinAndMapOne('user.unit', Unit, 'unit', 'user.unit = unit.id')
    .where('user.email= :email', {email: userName}) 
    .getOne();


    if(a){
      return this.unitService.findOne(a.unit.id);
    }else{
      return null;
    }
  }

  async getUsersCount(_unitId?: string) {
    let count
    let unitId = parseInt(_unitId)
    if (unitId !== -1){
      let childs = await this.unitService.getChildUnits(unitId)
      let unitIds = childs.map(o => {return o.id})
      unitIds.push(unitId)
      count = await this.repo.findAndCount({unit: {id: In(unitIds)}, status: Not(1)})
    } else {
      count = await this.repo.findAndCount({status: Not(1)})
    }
    return count[1]
  }

  async exportUsers(unitId: number, isAllChilds: string) {
    let ids = []
    let activestatus = RecordStatus.Active
    if (isAllChilds === 'true') {
      let childUnits = await this.unitService.getChildUnits(unitId)
      ids = childUnits.map(o => { return o.id })
    }
    ids.push(unitId)
    let data = this.usersRepository.createQueryBuilder('user')
      .innerJoinAndSelect(
        'user.unit',
        'unit',
        'user.unit = unit.id'
      )
      .where('user.status = :status AND unit.id IN (:ids)', { status: activestatus, ids: ids })

    let users = await data.getMany()
    let res = new ExportUserDto()
    res.users = users.map(u => {
      return {
        'Unit name': u.unit.name,
        'Name': u.firstName + ' ' + u.lastName,
        'Email': u.email
      }
    })

    return res

  }


  async importUsers(buffer: Buffer) {
    console.log("importUsers")
    const workbook = XLSX.read(buffer);
    let sheet = workbook.Sheets['USERS']
    let data = XLSX.utils.sheet_to_json(sheet);
    

    let token = await this.authService.getToken();


    let roles = await this.authService.getRolese(token);

    let units: Unit[] = [];
    let unitIds: number[] =  [];
    let result  = await Promise.all(data.map(async( d: any) => {
      let unitId = d['unit id'] as number;
      let email = d['email'] as string;
      let roleName = d['role'] as string;
      let password = "password";
      
      if(unitId && email && roles.data){
        let role = roles.data.find(r => r.code === roleName);
        if(role){        
          let unit= null;
          if(!unitIds.includes(unitId)){
            try{
              unit = await this.unitService.getOneById(unitId);            
              units.push(unit);
              unitIds.push(unit.id);
            }catch(err){
              return {...d, status: 'Not saved', message: 'Getting Unit is failed'}; 
            }            
          }else{
            unit = units.find(u => u.id === unitId);
          }
          if(unit){
            try{
              let lp = await this.authService.addLoginProfile(email, password, role, token);           
              if(lp.data){
                let user = new User();
                user.unit = unit;
                user.loginProfile = lp.data.id;
                user.email = email;                
                try{
                  let created = await this.repo.save(user);
                  return {...d, status: 'Saved', message: 'Saved'}; 
                }catch(err){
                  return {...d, status: 'Not saved', message: 'Useer creation failed'}; 
                }  
              }else{
                return {...d, status: 'Not saved', message: 'LP creation failed'}; 
              }
            }catch(err){
              return {...d, status: 'Not saved', message: 'LP creation failed'}; 
            }            
          }else{
            return {...d, status: 'Not saved', message: 'Unit not found'}; 
          }
        }else{
          return {...d, status: 'Not saved', message: 'Role not found'};
        }      
      }else{
        return {...d, status: 'Not saved',message: "ROlES, EMAIL, UNITID mission" };
      }
    }))


    return result;
  }

  async saveAllowedUnits(email: string, unitIds: number[]){
    const user =  await this.repo.findOne({email: email});
    if(user){
      try{
        let u = "";
        if(unitIds && unitIds.length > 0){
          if (unitIds.length === 1){
            u = unitIds.toString()
          } else {
            u = unitIds.join(",")
          }
        }
        let update = await this.repo.update({email: email}, {allowedSelectUnits: u})
        if(update.affected === 1){
          return true;
        }else{
          return false;
        }
      }catch(err){
        console.log(err);
        return false;
      }
    }else{
      return false;
    }
  }

  async saveAllowedFPProjects(email: string, projects: number[]){
    const user =  await this.repo.findOne({email: email});
    if(user){
      try{
        let u = "";
        if(projects && projects.length > 0){
          u = projects.join(",")
        }
        let update = await this.repo.update({email: email}, {allowedFPProjects: u})
        if(update.affected === 1){
          return true;
        }else{
          return false;
        }
      }catch(err){
        console.log(err);
        return false;
      }
    }else{
      return false;
    }
  }
}
