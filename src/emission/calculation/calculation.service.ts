import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { EmissionCalReqDto } from './dto/emission-req.dto';
import { EmissionCalResDto } from './dto/emission-res.dto';
import { ConfigService } from '@nestjs/config';
import { EmissionBaseEntity } from '../emission.base.entity';
import { ProjectUnitEmissionSourceService } from 'src/project/service/project-unit-emission-source.service';
import { ProjectService } from 'src/project/service/project.service';
import { ProjectEmissionSourceService } from '../emission-source/service/project-emission-source.service';
import { Project } from 'src/project/entities/project.entity';
import { Clasification } from 'src/project/enum/clasification.enum';
import { sourceName } from '../enum/sourcename.enum';
import { PesSumDataReqDto, ProjectSumDataReqDto, PuesSumDataReqDto } from 'src/project/dto/update-total-emission-req.dto';

@Injectable()
export class CalculationService {
  private readonly url: string = 'http://localhost:7090';
  constructor(
    private readonly httpService: HttpService,
    private puesService: ProjectUnitEmissionSourceService,
    private pesService: ProjectEmissionSourceService,
    private projectService: ProjectService,
  ) {}
  async calculate(data: EmissionCalReqDto): Promise<EmissionCalResDto> {
    try{
      const projectId = data.data.baseData.projectId;
      let methodology = await this.projectService.getMethodology(projectId);
      const res = await this.httpService
        .post<EmissionCalResDto>("http://localhost:7090/emission/cal", {
          sourceName: data.sourceName,
          data: data.data,
          methodology: methodology
        })
        .toPromise();      
        console.log("calcualtion request - ", data)
        console.log("calculated result - ", res.data);
      return res.data;
    }catch(err){
      console.error("errrpr .............")
      console.error(err.message);
    }
  }


  /**
   * 
   * 
   * @param current 
   * @param newCalc 
   * @returns 
   */
  getDiff(current : EmissionBaseEntity, newCalc: EmissionCalResDto){
    let updated = new EmissionCalResDto();

    let data= ['e_sc', 'e_sc_co2', 'e_sc_ch4', 'e_sc_n2o']

    if (newCalc === null){
      newCalc = new EmissionCalResDto()
      newCalc.e_sc = 0
      newCalc.e_sc_ch4 = 0
      newCalc.e_sc_co2 = 0
      newCalc.e_sc_n2o = 0
    }

    data.forEach(d => {
      if(newCalc[d]){
        if(current && current[d]){
          updated[d] = newCalc[d] - current[d];
        }else{
          updated[d] = newCalc[d];
        }
      }else{
        if(current && current[d]){
          updated[d] = - current[d];
        }else{
          updated[d] = 0;
        }
      }
    });
    return updated;
  }

  async updateTotalEmission(
    emission: EmissionCalResDto, 
    project: Project,
    clasification: Clasification, 
    sc: sourceName,
    unitId: number,
    empComData: {
      totalDirectRecords: number,
      totalInDirectRecords: number,
      totalOtherRecords: number,
      totalEmployees: number,
      totalEmployeesPaid: number,
      directSum: {
        e_sc_co2: number,
        e_sc_ch4: number,
        e_sc_n2o: number,
        e_sc: number,
      },
      indirectSum: {
        e_sc_co2: number,
        e_sc_ch4: number,
        e_sc_n2o: number,
        e_sc: number,
      },
      otherSum: {
        e_sc_co2: number,
        e_sc_ch4: number,
        e_sc_n2o: number,
        e_sc: number,
      }
    } | null= null
  ){

    if(sc === sourceName.passenger_road && empComData !== null &&  clasification != Clasification.OTHER && clasification != Clasification.ANY){
      this.updateEmployeeEmission(project, unitId, empComData);
    }else{
      let reqPues: PuesSumDataReqDto = {
        project: project,
        sourceName: sc,
        unitId: unitId,
        emission: emission,
        classification: clasification
      }
  
      this.puesService.addEmission(reqPues)
  
      let reqPes : PesSumDataReqDto = {
        project: project,
        sourceName: sc,
        emission: emission,
        classification: clasification
      }
      this.pesService.addEmission(reqPes);
  
  
      let reqProject: ProjectSumDataReqDto = {
        project: project,
        classification: clasification,
        emission: emission
      }
      this.projectService.addEmission(reqProject)
    }

  }

  getMapedEmission(currennt: number, factor: number){
    return currennt * factor;
  }

  async updateEmployeeEmission(project:Project,unitId:number, empComData: {
    totalDirectRecords: number,
    totalInDirectRecords: number,
    totalOtherRecords: number,
    totalEmployees: number,
    totalEmployeesPaid: number,
    directSum: {
      e_sc_co2: number,
      e_sc_ch4: number,
      e_sc_n2o: number,
      e_sc: number,
    },
    indirectSum: {
      e_sc_co2: number,
      e_sc_ch4: number,
      e_sc_n2o: number,
      e_sc: number,
    },
    otherSum: {
      e_sc_co2: number,
      e_sc_ch4: number,
      e_sc_n2o: number,
      e_sc: number,
    },
  }){

    console.log("empComData--------------------------------",empComData);

  
    let directEmpoyeeCount = empComData.totalEmployeesPaid;
    let indirectEmpoyeeCount = empComData.totalEmployees - empComData.totalEmployeesPaid;



    // --- UPDATE PUES total
    let directReq: PuesSumDataReqDto | null = null;
    let indirectReq: PuesSumDataReqDto | null = null;
    let otherReq: PuesSumDataReqDto | null = null;

    // calculate maped emission 
    if(empComData.totalDirectRecords > 0){
      if(directEmpoyeeCount == 0 || directEmpoyeeCount == undefined || directEmpoyeeCount == null || directEmpoyeeCount.toString() == 'NaN'){
        directEmpoyeeCount = empComData.totalDirectRecords;
      }
      let dirctMapped = {
        e_sc_co2: this.getMapedEmission(empComData.directSum.e_sc_co2, (directEmpoyeeCount/empComData.totalDirectRecords)),
        e_sc_ch4: this.getMapedEmission(empComData.directSum.e_sc_ch4, (directEmpoyeeCount/empComData.totalDirectRecords)),
        e_sc_n2o: this.getMapedEmission(empComData.directSum.e_sc_n2o, (directEmpoyeeCount/empComData.totalDirectRecords)),
        e_sc: this.getMapedEmission(empComData.directSum.e_sc, (directEmpoyeeCount/empComData.totalDirectRecords)),
      }
      console.log("dirctMapped--",dirctMapped)
      directReq = {
        project: project,
        sourceName: sourceName.passenger_road,
        unitId: unitId,
        emission: dirctMapped,
        classification: Clasification.DIRECT
      }
    }

    if(empComData.totalInDirectRecords > 0){

      if(indirectEmpoyeeCount == 0 || indirectEmpoyeeCount == undefined || indirectEmpoyeeCount == null || indirectEmpoyeeCount.toString() == "NaN"){
        indirectEmpoyeeCount = empComData.totalInDirectRecords;
      }
      console.log("vvvvvvvvvv",{
        indirectEmpoyeeCount:indirectEmpoyeeCount,
        totalInDirectRecords:empComData.totalInDirectRecords
      })


      let indirctMapped = {
        e_sc_co2: this.getMapedEmission(empComData.indirectSum.e_sc_co2, (indirectEmpoyeeCount/empComData.totalInDirectRecords)),
        e_sc_ch4: this.getMapedEmission(empComData.indirectSum.e_sc_ch4, (indirectEmpoyeeCount/empComData.totalInDirectRecords)),
        e_sc_n2o: this.getMapedEmission(empComData.indirectSum.e_sc_n2o, (indirectEmpoyeeCount/empComData.totalInDirectRecords)),
        e_sc: this.getMapedEmission(empComData.indirectSum.e_sc, (indirectEmpoyeeCount/empComData.totalInDirectRecords)),
      }
      indirectReq = {
        project: project,
        sourceName: sourceName.passenger_road,
        unitId: unitId,
        emission: indirctMapped,
        classification: Clasification.INDIRECT
      }
    }

    if(empComData.totalOtherRecords > 0){
      let otherMapped = {
        e_sc_co2: this.getMapedEmission(empComData.otherSum.e_sc_co2, 1),
        e_sc_ch4: this.getMapedEmission(empComData.otherSum.e_sc_ch4, 1),
        e_sc_n2o: this.getMapedEmission(empComData.otherSum.e_sc_n2o, 1),
        e_sc: this.getMapedEmission(empComData.otherSum.e_sc, 1),
      }
      console.log("otherMapped--",otherMapped)
      otherReq = {
        project: project,
        sourceName: sourceName.passenger_road,
        unitId: unitId,
        emission: otherMapped,
        classification: Clasification.OTHER
      }
    }

  

    await this.puesService.updatePRoadEmission(directReq, indirectReq, otherReq); // replace coresoponding emission of PUES with maped emission

    // --- UPDATE PES total
    let  proadSum = await this.puesService.getPRoadTotal(project.id);  // get the total of PUES 
    // keep the currect PES total in a variable // TODO
    if(proadSum && proadSum.length > 0){   
      // console.log("PUES - SUM", proadSum) 
      await this.pesService.updatePRoad(project.id, proadSum[0]); // replace coresoponding emission of PES with calculated total
    }
    
    // --- UPDATE P total
    let pTotal = await this.pesService.getProjectTotal(project.id);
    if(pTotal && pTotal.length > 0){   
      // console.log(" --- PES - SUM - p-id ", project.id, pTotal[0])
      this.projectService.updateProjectTotal(project.id, pTotal[0])
    } 
  }




}
