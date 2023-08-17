import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { CalculationService } from '../../calculation/calculation.service';
import { ForkliftsActivityData } from '../entities/forklift.entity';
import { ForkliftsDto } from '../../calculation/dto/forklifts.dto';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { PuesDataReqActivityData, PuesDataReqDto } from 'src/project/dto/pues-data-req.dto';
import { PuesSumDataReqDto, PesSumDataReqDto, ProjectSumDataReqDto } from 'src/project/dto/update-total-emission-req.dto';
import { Ownership } from 'src/project/enum/ownership.enum';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { ProjectUnitEmissionSourceService } from 'src/project/service/project-unit-emission-source.service';
import { ProjectService } from 'src/project/service/project.service';


@Injectable()
export class ForkliftsService extends TypeOrmCrudService<ForkliftsActivityData>{
  constructor(
    @InjectRepository(ForkliftsActivityData) repo,
    @InjectRepository(ForkliftsActivityData)
    private readonly forkliftRepository: Repository<ForkliftsActivityData>,
    private readonly calculationService: CalculationService,
    private puesService: ProjectUnitEmissionSourceService,
    private pesService: ProjectEmissionSourceService,
    private projectService: ProjectService
  ) {
    super(repo);
  }

  async create(createForkliftDto: ForkliftsActivityData) {

    const calculationData: ForkliftsDto = {
      year: createForkliftDto.year,
      fuelType: createForkliftDto.fuelType,
      consumption: createForkliftDto.consumption,
      consumption_unit: createForkliftDto.consumption_unit,
      baseData: await this.getBaseData(createForkliftDto)
    };
    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Forklifts,
      data: calculationData,
    });
    this.updateTotalEmission(createForkliftDto, calculationData, emission)
    createForkliftDto.emission = emission.e_sc  ? emission.e_sc : 0;

    createForkliftDto.e_sc = emission.e_sc  ? emission.e_sc : 0;
    createForkliftDto.e_sc_co2 = emission.e_sc_co2  ? emission.e_sc_co2 : 0;
    createForkliftDto.e_sc_ch4 = emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
    createForkliftDto.e_sc_n2o = emission.e_sc_n2o  ? emission.e_sc_n2o : 0;

    return await this.forkliftRepository.save(createForkliftDto);
  }

  findAll() {
    return this.forkliftRepository.find();
  }



  async update(id: number, updateForkliftDto: ForkliftsActivityData) {

    const calculationData: ForkliftsDto = {
      year: updateForkliftDto.year,
      fuelType: updateForkliftDto.fuelType,
      consumption: updateForkliftDto.consumption,
      consumption_unit: updateForkliftDto.consumption_unit,
      baseData: await this.getBaseData(updateForkliftDto)
    };
    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Forklifts,
      data: calculationData,
    });

    if (updateForkliftDto.e_sc !== emission.e_sc){
      this.updateTotalEmission(updateForkliftDto, calculationData, emission)
    }
    updateForkliftDto.emission = emission.e_sc  ? emission.e_sc : 0;

    updateForkliftDto.e_sc = emission.e_sc  ? emission.e_sc : 0;
    updateForkliftDto.e_sc_co2 = emission.e_sc_co2  ? emission.e_sc_co2 : 0;
    updateForkliftDto.e_sc_ch4 = emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
    updateForkliftDto.e_sc_n2o = emission.e_sc_n2o  ? emission.e_sc_n2o : 0;

    const updated = await this.repo.update( {
      id: id
    }, updateForkliftDto);
    if(updated.affected === 1){
      return await this.repo.findOne(id);
    }else{
      throw new InternalServerErrorException("Updating is failed");
    }

  }

  remove(id: number) {
    return `This action removes a #${id} forklift`;
  }

  async getBaseData(dto: ForkliftsActivityData): Promise<BaseDataDto> {
    let activityInfo =  new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.Forklifts
    req.unitId = dto.unit.id
    req.user = dto.user
    req.activityInfo = activityInfo

    let puesData = await this.puesService.getPuesData(req)
    // console.log(puesData)

    return {
      clasification: puesData.clasification,
      tier: puesData.tier,
      sourceType: puesData.sourceType,
      industry: puesData.industry.code,
      countryCode: puesData.countryCode,
      projectId: dto.project.id
    }
  }

  async updateTotalEmission(dto: ForkliftsActivityData, calData: ForkliftsDto, emission: any){
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Forklifts,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes : PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Forklifts,
      emission: emission,
      classification: calData.baseData.clasification
    }
    this.pesService.addEmission(reqPes)

    let reqProject: ProjectSumDataReqDto = {
      project: dto.project,
      classification: calData.baseData.clasification,
      emission: emission
    }
    this.projectService.addEmission(reqProject)
  }
}
