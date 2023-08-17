import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudRequestInterceptor } from '@nestjsx/crud';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Project } from 'src/project/entities/project.entity';
import { ProjectService } from 'src/project/service/project.service';
import { RecordStatus } from 'src/shared/entities/base.tracking.entity';
import { getConnection, getManager, Repository } from 'typeorm';
import { NumEmployee } from './entities/num-employee.entity';
import { UnitService } from './unit.service';
import * as XLSX from 'xlsx';
import { buffer, delay } from 'rxjs';
import { UnitDetails } from './entities/unit-details.entity';
import { Unit } from './entities/unit.entity';

@Injectable()
export class NumEmployeesService extends TypeOrmCrudService<NumEmployee>{

  private excelBulkVariableMapping: { code: string, name: string }[] = [

    { code: "totalEmployees", name: 'Total Employees' },
    { code: "totalEmployeesPaid", name: 'Total Employees Paid' },
    { code: "year", name: 'Year' },
    // { code: "totalRevenue", name: 'totalRevenue' },
    // { code: "totalRevenue_unit", name: 'totalRevenue_unit' },
    // { code: "target", name: 'target' },
  ]

  constructor(
    @InjectRepository(NumEmployee) repo,
    @InjectRepository(Unit) private readonly unitRepo: Repository<Unit>,

    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(UnitDetails) private readonly unitDetailRepo: Repository<UnitDetails>,

    public unitservice: UnitService,
    public projectservice: ProjectService,


  ) {
    super(repo);

  }

  async GetUnitRevenue(unitIds: number[], year: number): Promise<any> {

    try {
      let filterComparisonGraph = `graph.year =  :year and unit.id IN (:unitIds) `
      let data = this.repo.createQueryBuilder('graph')

        .innerJoin(
          'graph.unitDetail',
          'unitDetail',
          'unitDetail.id = graph.unitDetailId'
        )
        .innerJoin(
          'unitDetail.unit',
          'unit',
          'unit.id = unitDetail.unitId'
        )

        .select(["unit.id", "graph.totalRevenue", "graph.year"])
        .where(filterComparisonGraph, { year, unitIds })

      return data.execute();
    } catch (errr) {
      console.error(errr)
      throw new InternalServerErrorException(errr);
    }
  }


  async getTotalEmployeesByUnit(unitIds: number[], year: number): Promise<NumEmployee> {

    let status = RecordStatus.Active;
    const queryRunner = getConnection().createQueryRunner();
    try {
      await queryRunner.connect();
      // await queryRunner.startTransaction();
      let noe = queryRunner.manager.getRepository(NumEmployee)
        .createQueryBuilder('noe')
        .leftJoinAndSelect(
          'noe.unitDetail',
          'unitDetails',
          'unitDetails.id = noe.unitDetailId'
        ).leftJoinAndSelect(
          'unitDetails.unit',
          'unit',
          'unit.id = unitDetails.unitId'
        )
        .where('unit.id IN (:...unitIds) AND noe.year = :year AND noe.status = :status ', { unitIds, year, status })

        // console.log(noe.getQuery())
        // console.log(noe.getParameters())
        return await noe.getOne();
        // return res;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err);
    }finally{
      await queryRunner.release();
    }

  }


  async getTotalEmployees(projectId: number) {

    const queryRunner = getConnection().createQueryRunner();
    try {
      await queryRunner.connect();
      // await queryRunner.startTransaction();
      let project = await queryRunner.manager.getRepository(Project)
        .createQueryBuilder('p')
        .leftJoinAndSelect(
          'p.ownerUnit',
          'ownerUnit',
          'ownerUnit.id = p.ownerUnit'
        )
        .where('p.id = :projectId ', { projectId })
        .getOne();

      let unitId = project.ownerUnit.id;
      let year = project.year;

      let childIds = (await this.unitservice.getChildUnits(unitId)).map(u => u.id);
      childIds.push(unitId.toString());

      let res = await this.getUnitsDetailsIds(childIds, +year)
      return res;

    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err);
    }finally{
      await queryRunner.release();
    }

  }


  async getUnitsDetailsIds(unitIds: number[], year: number) {

    const queryRunner = getConnection().createQueryRunner();
    try {
      await queryRunner.connect();
      // await queryRunner.startTransaction();
      let res = await queryRunner.manager.getRepository(NumEmployee)
        .createQueryBuilder('ne')
        .leftJoinAndSelect(
          'ne.unitDetail',
          'unitDetail',
          'unitDetail.id = ne.unitDetail'
        )
        .leftJoinAndSelect(
          'unitDetail.unit',
          'unit',
          'unit.id = unitDetail.unit'
        )
        .where('ne.year = :year AND unit.id IN (:...unitIds)', { unitIds, year })
        .getMany();
      let totalemployee: number = 0;

      res.forEach(a => totalemployee += a.totalEmployees);
      console.log(totalemployee)

      return totalemployee;

    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err);
    } finally {
      queryRunner.release();
    }
  }

  getVariableMapping() {
    return this.excelBulkVariableMapping;
  }


  async uploadBulk(buffer: Buffer) {

    const workbook = XLSX.read(buffer);
    let data_sheet = workbook.Sheets['in'];
    try {
      if (data_sheet) {
        let data = XLSX.utils.sheet_to_json(data_sheet);

        if (data) {
          for (const element of data) {
            const result: any = await this.excellBulkUpload(element);
            console.log(result);
          }

          return {
            status: true,
            message: 'Uploaded'
          }
        } else {
          return {
            status: false,
            message: 'data is null'
          }
        }
      } else {
        console.log("no data_sheet");
        throw new InternalServerErrorException("no data_sheet")
      }
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err)
    }

  }



  async excellBulkUpload(data: any) {

    let unitId = data['UnitId']
    const unitdetailrepo = getManager().getRepository(UnitDetails);
    let unitDetail = await this.getUnitDetails(unitId, unitdetailrepo)
    let dto = new NumEmployee();
    dto.unitDetail = unitDetail;

    this.excelBulkVariableMapping.forEach(vm => {

      if (data[vm.name]) {
        dto[vm.code] = data[vm.name];
      }
    })

    try {
      let unitDetaild = dto.unitDetail.id;
      const numeplpyeerepo = getManager().getRepository(NumEmployee);

      let numeplpyee = await numeplpyeerepo
        .createQueryBuilder('ne')
        .leftJoinAndSelect(
          'ne.unitDetail',
          'unitDetail',
          'unitDetail.id = ne.unitDetail'
        )
        .where('unitDetail.id = :unitDetaild', { unitDetaild })
        .getMany();

      const result = numeplpyee.filter((obj) => {
        return obj.year === dto.year;
      });
      if (result.length > 0) {
        return this.repo.update(numeplpyee[0].id, dto);
      }
      else {
        return this.repo.save(dto);

      }
    } catch (err) {
      console.log(err);
      return null;
    }

  }



  async getUnitDetails(unitId: number, unitdetailrepo: any): Promise<UnitDetails> {

    let unitDetaildto = new UnitDetails();
    const queryRunner = getConnection().createQueryRunner();
    queryRunner.connect();
    queryRunner.startTransaction();

    try {
      let res = await unitdetailrepo
        .createQueryBuilder('ud')
        .leftJoinAndSelect(
          'ud.unit',
          'unit',
          'unit.id = ud.unit'
        )
        .where('ud.unitId = :unitId', { unitId })
        .getMany();

      if (res.length > 0) {

        unitDetaildto = res[0];

      } else {

        let unit = await this.unitRepo.find({ id: unitId });
        unitDetaildto.unit = unit[0];
        this.unitDetailRepo.save(unitDetaildto);
      }

    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err);
    }
    return unitDetaildto;

  }

}

