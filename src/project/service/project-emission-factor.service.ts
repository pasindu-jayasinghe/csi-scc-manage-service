import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { isNull } from '@nestjsx/util';
import { retry } from 'rxjs';
import { AuthService } from 'src/auth/service/auth.service';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { subcatDto } from 'src/report/dto/subcatDto.dto';
import { subefDto } from 'src/report/dto/subefDto.dto';
import { subeftestDto } from 'src/report/dto/subeftestDto.dto';
import { getConnection } from 'typeorm';
import { sectorES, commonEFParas, currencies } from '../dto/emission-factor.dto';
import { PuesDataReqActivityData, PuesDataReqDto } from '../dto/pues-data-req.dto';
import { Project } from '../entities/project.entity';
import { Ownership } from '../enum/ownership.enum';
import { ProjectUnitEmissionSourceService } from './project-unit-emission-source.service';

const ES_URL = process.env.ES_URL || "http://localhost:7090"

@Injectable()
export class ProjectEmissionFactorService {

  apiConfig: any = {};
  constructor(
    private httpService: HttpService,
    private puesService: ProjectUnitEmissionSourceService,
    private authService: AuthService
  ) {

  }

  async setToken(){
    let token = await this.authService.getToken();
      this.apiConfig = {headers: {
        "Authorization": "Bearer " + token
      }}
  }

  async getEmissionFactors(esCodes: string[], projectId: number) {
    let emissionFactors = []
    const queryRunner = getConnection().createQueryRunner()
    try {
      await queryRunner.connect();
      // await queryRunner.startTransaction();
      let p = queryRunner.manager.getRepository(Project)
        .createQueryBuilder('p')
        .leftJoinAndSelect(
          'p.ownerUnit',
          'unit',
          'unit.id = p.ownerUnit'
        )
        .leftJoinAndSelect(
          'unit.country',
          'country',
          'country.id = unit.country'
        )
        .where('p.id = :id', { id: projectId })
      let project = await p.getOne();

      if (!Array.isArray(esCodes)) esCodes = [esCodes];
      for await (const code of esCodes) {
        let source = this.formatSourceName(code)
        let data = queryRunner.manager.getRepository(source.class)
          .createQueryBuilder('acData')
          .innerJoin(
            'acData.project',
            'project',
            'project.id = acData.project'
          )
          .leftJoinAndSelect(
            'acData.unit',
            'unit',
            'unit.id = acData.unit'
          )
          .where('project.id = :id', { id: projectId });

        const res_1 = await data.getMany();

        let factors = []

        if (res_1.length > 0) {
          let sectores = new sectorES()
          if (sectores.common.includes(code as sourceName)) {
            let es = await this.getCommonEFs(res_1, code, project)
            if (es && es.length > 0) factors.push(...es)
          }
          if (sectores.fuelFactors.includes(code as sourceName)) {
            let es = await this.getFuelFactors(res_1, code, project)
            if (es !== undefined) factors.push(...es)
          }
          if (sectores.fuelSecification.includes(code as sourceName)) {
            let es = await this.getFuelSpecifications(res_1, code, project)
            if (es !== undefined) factors.push(es)
          }
          if (sectores.fuelPrice.includes(code as sourceName)) {
            let es = await this.getFuelPrices(res_1, code, project)
            if (es !== undefined) factors.push(...es)
          }
          if (sectores.transport.includes(code as sourceName)) {
            let es = await this.gettransportFactors(res_1, code, project)
            if (es !== undefined) factors.push(...es)
          }
          if (sectores.freight_water.includes(code as sourceName)) {
            let es = await this.getFreightwaterEFs(res_1, code, project)
            if (es !== undefined) factors.push(...es)
          }
          if (sectores.defra.includes(code as sourceName)) {
            let es = await this.getDefraEFs(res_1, code, project)
            if (es !== undefined) factors.push(...es)
          }
        }
        emissionFactors.push({ es: code, data: factors })
      }

    } catch (error) {
      console.error(error);
      // await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      await queryRunner.release();
    }

    // console.log(JSON.stringify(emissionFactors))
    return emissionFactors
  }

  async getCommonEFs(acData: any[], source: string, project: Project) {
    let common = new commonEFParas()
    let commonEs = common[source]

    let codes = []

    if (commonEs !== undefined && commonEs.length > 0) {
      commonEs.forEach((_var: any) => {
        if (_var === 'common') {
          codes.push(...['gwp_co2', 'gwp_ch4', 'gwp_n2o'])
          commonEs.splice(commonEs.indexOf('common'), 1)
        } else if (_var === 'electricity') {
          codes.push('EF_GE')
          commonEs.splice(commonEs.indexOf('electricity'), 1)
        }else if (_var === 't_n_d_loss') {
          codes.push('TD_LOSS')
          commonEs.splice(commonEs.indexOf('t_n_d_loss'), 1)
        } else if (_var === 'water') {
          codes.push(...['EF_GE', 'CF_MW'])
          commonEs.splice(commonEs.indexOf('water'), 1)
        } else if (_var === 'welding') {
          codes.push(...['ACEYTELENE_FACTOR', 'LIQUIDCO2_FACTOR'])
          commonEs.splice(commonEs.indexOf('welding'), 1)
        }
      })

      if (commonEs.length > 0) {
        acData.forEach(data => {
          if ((source === sourceName.Boilers) || source === sourceName.cooking_gas) {
            if (data[commonEs[0]]) {
              codes.push(...['ef_co2_' + data[commonEs[0]].split(" ").join("_"), 'ef_ch4_' + data[commonEs[0]].split(" ").join("_"), 'ef_n2o_' + data[commonEs[0]].split(" ").join("_")])
            }
          } else if (source === sourceName.Refrigerant) {
            if (data[commonEs[0]]) {
              codes.push('GWP_RG_' + data[commonEs[0]])
            }
          } else {
            commonEs.forEach((_var: any) => {
              if (data[_var]) {
                codes.push(data[_var])
              }
            })
          }
        })
      }

      await this.setToken()

      if (codes.length > 0) {
        const url = `${ES_URL}/common-emission-factor/get-common-ef`
        let data = {
          "year": project.year,
          "countryCode": project.ownerUnit.country.code,
          "codes": codes
        }
        let factor = (await this.httpService.post(url, data, this.apiConfig).toPromise()).data
        factor = factor.map(fac => {
          fac["factorType"] = "common"
          return fac
        })
        return factor
      }
    }



  }

  async getFuelFactors(acData: any[], source: string, project: Project) {
    let factors = []
    let req = []
    await this.setToken()
    const url = `${ES_URL}/fuelfactor/get-ff`
    return await Promise.all(
      acData.map(async data => {
        let baseData = await this.getBaseData(data, project, data.unit.id, source)

        if (baseData && baseData.clasification && baseData.sourceType) {
          let _data: any
          if (data.fuelType) {
            if (source === sourceName.freight_water) {
              _data = {
                "emsource": source,
                "source": baseData.sourceType,
                "industry": baseData.industry,
                "tier": baseData.tier,
                "year": project.year,
                "countryCode": baseData.countryCode,
                "codes": [data.fuelType],
                "optional": {
                  "parameter_unit": data.fc_unit
                }
              }

            } else if (source === sourceName.freight_offroad) {
              _data = {
                "emsource": source,
                "source": baseData.sourceType,
                "industry": baseData.industry,
                "tier": baseData.tier,
                "year": project.year,
                "countryCode": baseData.countryCode,
                "codes": [data.fuelType],
                "optional": {
                  "stroke": data.stroke
                }
              }

            } else if (source === sourceName.offroad_machinery) {
              _data = {
                "emsource": source,
                "source": baseData.sourceType,
                "industry": baseData.industry,
                "tier": baseData.tier,
                "year": project.year,
                "countryCode": baseData.countryCode,
                "codes": [data.fuelType],
                "optional": {
                  "stroke": data.stroke
                }
              }
            } else {
              _data = {
                "emsource": source,
                "source": baseData.sourceType,
                "industry": baseData.industry,
                "tier": baseData.tier,
                "year": project.year,
                "countryCode": baseData.countryCode,
                "codes": [data.fuelType]
              }
            }
          }

          if (_data !== undefined) {
            const isFound = req.some(e => {
              if (e.source === _data.source && JSON.stringify(e.codes).toUpperCase() === JSON.stringify(_data.codes).toUpperCase()
                && e.industry === _data.industry && e.year === _data.year) {
                return true;
              }
              return false;
            });

            if (!isFound) {
              req.push(_data)
              let factor = (await this.httpService.post(url, _data, this.apiConfig).toPromise()).data
              if (factor && factor !== -1) {
                factor["factorType"] = "fuelFactor"
                factors.push(factor)
              }
            }
          }
        }

      })
    ).then(() => {
      return factors
    })
  }

  async getFuelSpecifications(acData: any[], source: string, project: Project) {
    let codes = []

    acData.forEach(data => {
      if (data.fuelType) codes.push(data.fuelType)
    })

    if (codes.length > 0) {
      await this.setToken()
      const url = `${ES_URL}/fuelspecific/get-fuel-specific`
      let data = {
        "year": project.year,
        "countryCode": project.ownerUnit.country.code,
        "codes": codes
      }
      let factor = (await this.httpService.post(url, data,this.apiConfig).toPromise()).data
      if (factor && factor !== -1) {
        factor["factorType"] = "fuelSpecific"
        return factor
      }
    }



  }

  async getFuelPrices(acData: any[], source: string, project: Project) {
    let factors = []
    let req = []
    await this.setToken()
    const url = `${ES_URL}/fuelprice/get-fuel-price`
    return await Promise.all(
      acData.map(async data => {
        if (
          (data.fc_unit && currencies.includes(data.fc_unit)) ||
          (data.fuelConsumption_unit && currencies.includes(data.fuelConsumption_unit)) ||
          (data.btFuelConsumption_unit && currencies.includes(data.btFuelConsumption_unit))
        ) {
          let currency
          if (data.fc_unit) currency = data.fc_unit
          if (data.fuelConsumption_unit) currency = data.fuelConsumption_unit
          if (data.btFuelConsumption_unit) currency = data.btFuelConsumption_unit
          let _data = {
            "year": project.year,
            "month": data.month,
            "curruncy": currency,
            "countryCode": project.ownerUnit.country.code,
            "codes": [data.fuelType]
          }

          if (_data !== undefined) {
            const isFound = req.some(e => {
              if (e.year === _data.year && e.month === _data.month && e.curruncy === _data.curruncy && JSON.stringify(e.codes) === JSON.stringify(_data.codes)) {
                return true;
              }
              return false;
            });

            if (!isFound) {
              req.push(_data)
              let factor = (await this.httpService.post(url, _data, this.apiConfig).toPromise()).data
              if (factor && factor !== -1) {
                factor["factorType"] = "fuelPrice"
                factors.push(factor)
              }
            }
          }

        }
      })
    ).then(() => {
      return factors
    })
  }

  async gettransportFactors(acData: any[], source: string, project: Project) {
    let req = []
    let factors = []
    await this.setToken()
    const url = `${ES_URL}/transfac/get-tf`
    return await Promise.all(
      acData.map(async data => {
        let _data
        if (data.publicMode) {
          _data = {
            "year": project.year,
            "countryCode": project.ownerUnit.country.code,
            "codes": [data.publicMode]
          }
        }
        if (_data !== undefined) {
          const isFound = req.some(e => {
            if (e.year === _data.year && e.countryCode === _data.countryCode && JSON.stringify(e.codes) === JSON.stringify(_data.codes)) {
              return true;
            }
            return false;
          });
          if (!isFound) {
            req.push(_data)
            let factor = (await this.httpService.post(url, _data,this.apiConfig).toPromise()).data
            if (factor && factor !== -1) {
              factor["factorType"] = "transport"
              factors.push(factor)
            }
          }
        }
      })
    ).then(() => {
      return factors
    })
  }

  async getFreightwaterEFs(acData: any[], source: string, project: Project) {
    let req = []
    let factors = []
    await this.setToken()
    const url = `${ES_URL}/FreightWaterFac/get-fwf`
    return await Promise.all(
      acData.map(async (data: any) => {
        let _data = {
          "year": project.year,
          "activity": data.activity,
          "type": data.type,
          "size": data.size
        }

        if (_data !== undefined) {
          const isFound = req.some(e => {
            if (e.year === _data.year && e.activity === _data.activity && e.type === _data.type && e.size === _data.size) {
              return true;
            }
            return false;
          });
          if (!isFound) {
            req.push(_data)
            let factor = (await this.httpService.post(url, _data,this.apiConfig).toPromise()).data
            if (factor && factor !== -1) {
              factor["factorType"] = "freightWater"
              factors.push(factor)
            }
          }
        }
      })
    ).then(() => {
      return factors
    })

  }

  async getDefraEFs(acData: any[], source: string, project: Project) {
    // let baseData = await this.getBaseData(acData, project,  source)
    // if (baseData && baseData.clasification && baseData.sourceType){
    let req = []
    let factors = []
    await this.setToken()
    const url = `${ES_URL}/defra/get-defra`
    return await Promise.all(
      acData.map(async data => {
        let baseData = await this.getBaseData(data, project, data.unit.id, source)
        if (baseData && baseData.clasification && baseData.sourceType) {
          let _data = {
            "year": project.year,
            "tier": baseData.tier,
            "codes": [(data.wasteType.toUpperCase()).split(" ").join("_")]
          }
          if (_data !== undefined) {
            const isFound = req.some(e => {
              if (e.year === _data.year && e.tier === _data.tier && JSON.stringify(e.codes) === JSON.stringify(_data.codes) &&
                e.year === _data.year) {
                return true;
              }
              return false;
            });
            if (!isFound) {
              req.push(_data)
              let factor = (await this.httpService.post(url, _data,this.apiConfig).toPromise()).data
              if (factor && factor !== -1) {
                factor["factorType"] = "defra"
                factor["disposalMethod"] = data.disposalMethod
                factors.push(factor)
              }
            }
          }
        }
      })
    ).then(() => {
      return factors
    })
    // }

  }

  formatSourceName(s: string) {
    let _class = (s.split("_").join(" ")
      .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())
      .replace(/\s/g, '')) + 'ActivityData'

    let _entity = s + '_activity_data'
    return {
      class: _class, entity: _entity
    }
  }

  async getBaseData(dto: any, project: Project, unitId: number, source: string): Promise<BaseDataDto> {
    try {
      let activityInfo = new PuesDataReqActivityData()
      activityInfo.owenerShip = Ownership.getkey(dto.ownership)
      activityInfo.stationary = dto.stationary
      activityInfo.mobile = dto.mobile
      let req = new PuesDataReqDto()
      req.project = project
      req.sourceName = source as sourceName
      req.unitId = unitId
      req.user = dto.user
      req.activityInfo = activityInfo

      let puesData = await this.puesService.getPuesData(req)

      return {
        clasification: puesData.clasification,
        tier: puesData.tier,
        sourceType: puesData.sourceType,
        industry: puesData.industry.code,
        countryCode: puesData.countryCode,
        projectId: -1
      }
    } catch (error) {
      return new BaseDataDto()
    }

  }



  public assignsub(data: any, facType: string) {
    let category: any[] = [];
    let gwp = ["gwp_co2", "gwp_ch4", "gwp_n2o"]

    for (let i = 0; i < data.length; i++) {
      let dataobj = new subefDto();

      if (data[i].factorType == facType && !gwp.includes(data[i].code)) {
        dataobj.name = data[i].name;
        dataobj.quantity = data[i].value;
        dataobj.unit = data[i].unit;
        dataobj.source = this.getReference(data[i].reference) 
        category.push(dataobj);
        console.log(dataobj)

      }

    }

    return {
      category: category,
      numOfRows: category.length
    };

  }



  public assignsubfuel(data: any, facType: string, fuelTypes) {

    let category: any[] = [];
    let row = 0 

    for (let i = 0; i < data.length; i++) {

      let dataobj1 = new subefDto();
      let dataobj2 = new subefDto();
      let dataobj3 = new subefDto();
      let dataobj4 = new subefDto();
      let dataobj5 = new subefDto();
      let dataobj6 = new subefDto();
      let dataobj7 = new subefDto();
      let dataobj8 = new subefDto();
      let dataobj9 = new subefDto();

      let subefs = new subeftestDto();
      let subcategory: any[] = [];


      if (data[i].factorType == facType) {

        let fuel = fuelTypes.find(o => o.code === data[i].code)
        subefs.name = (fuel !== undefined) ? fuel.name : data[i].code

        dataobj1.name = "CH₄ (Default)";
        dataobj1.quantity = this.thousandSeperate(this.checkVal(data[i].ch4_default), 6) ;
        dataobj1.unit = data[i].unit;
        dataobj1.source = this.getReference(data[i].reference)  

        // dataobj2.name = "CH₄ (Upper)";
        // dataobj2.quantity = this.thousandSeperate(this.checkVal(data[i].ch4__upper), 6) ;
        // dataobj2.unit = data[i].unit;

        // dataobj3.name = "CH₄ (Lower)";
        // dataobj3.quantity = this.thousandSeperate(this.checkVal(data[i].ch4_lower), 6) ;
        // dataobj3.unit = data[i].unit;

        dataobj4.name = "N₂O (Default)";
        dataobj4.quantity = this.thousandSeperate(this.checkVal(data[i].n20_default), 6) ;
        dataobj4.unit = data[i].unit;
        dataobj4.source = this.getReference(data[i].reference) 

        // dataobj5.name = "N₂O (Upper)";
        // dataobj5.quantity = this.thousandSeperate(this.checkVal(data[i].n20__upper), 6) ;
        // dataobj5.unit = data[i].unit;

        // dataobj6.name = "N₂O (Lower)";
        // dataobj6.quantity = this.thousandSeperate(this.checkVal(data[i].n20_lower), 6) ;
        // dataobj6.unit = data[i].unit;


        dataobj7.name = "CO₂ (Default)";
        dataobj7.quantity = this.thousandSeperate(this.checkVal(data[i].co2_default), 6) ;
        dataobj7.unit = data[i].unit;
        dataobj7.source = this.getReference(data[i].reference) 

        // dataobj8.name = "CO₂ (Upper)";
        // dataobj8.quantity = this.thousandSeperate(this.checkVal(data[i].co2__upper), 6) ;
        // dataobj8.unit = data[i].unit;

        // dataobj9.name = "CO₂ (Lower)";
        // dataobj9.quantity = this.thousandSeperate(this.checkVal(data[i].co2_lower), 6) ;
        // dataobj9.unit = data[i].unit;

        subcategory.push(dataobj1, dataobj4, dataobj7);

        subefs.subcat = subcategory;
        subefs.cat2Length = subcategory.length

        row += subcategory.length
        category.push(subefs)

      }

    }
    return {
      category: category,
      numOfRows: row
    };

  }


  public assignsubfuelsp(data: any, facType: string, fuelTypes) {

    let category: any[] = [];
    let row = 0

    for (let i = 0; i < data.length; i++) {

      let subefs = new subeftestDto();
      let subcategory: any[] = [];

      let dataobj1 = new subefDto();
      let dataobj2 = new subefDto();
  

      if (data[i].factorType == facType) {

        let fuel = fuelTypes.find(o => o.code === data[i].code)
        subefs.name = (fuel !== undefined) ? fuel.name : data[i].code
        dataobj1.name = "Net Calorific Value";
        dataobj1.quantity = this.thousandSeperate(this.checkVal(data[i].ncv), 6) ;
        dataobj1.unit = data[i].unit_ncv;

        dataobj2.name = "Density";
        dataobj2.quantity = this.thousandSeperate(this.checkVal(data[i].density), 6) ;
        dataobj2.unit = data[i].unit_density;

        subcategory.push(dataobj1, dataobj2);
        subefs.subcat = subcategory;
        subefs.cat2Length = subcategory.length

        row += subcategory.length
        category.push(subefs)


      }

    }
    return {
      category: category,
      numOfRows: row
    };

  }


  public assignsubtrans(data: any, facType: string) {

    let category: any[] = [];
    let row = 0
   

    for (let i = 0; i < data.length; i++) {

      let dataobj1 = new subefDto();
      let dataobj2 = new subefDto();
      let dataobj3 = new subefDto();
      let dataobj4 = new subefDto();
      let dataobj5 = new subefDto();
      let subefs = new subeftestDto();
      let subcategory: any[] = [];

      if (data[i].factorType == facType) {

        subefs.name = data[i].name

        dataobj1.name = "CO₂";
        dataobj1.quantity = this.thousandSeperate(this.checkVal(data[i].co2), 6) ;
        dataobj1.unit = "";

        dataobj2.name = "CH₄";
        dataobj2.quantity = this.thousandSeperate(this.checkVal(data[i].ch4), 6) ;
        dataobj2.unit = "";

        dataobj3.name = "N₂O";
        dataobj3.quantity = this.thousandSeperate(this.checkVal(data[i].n2o), 6) ;
        dataobj3.unit = "";

        
        dataobj4.name = "gKm";
        dataobj4.quantity = this.thousandSeperate(this.checkVal(data[i].gKm), 6) ;
        dataobj4.unit = "";
        
        dataobj5.name = "kg CO₂ePKm";
        dataobj5.quantity = this.thousandSeperate(this.checkVal(data[i].kgco2ePKm), 6) ;
        dataobj5.unit = "";


        subcategory.push(dataobj1, dataobj2,dataobj3,dataobj4,dataobj5);
        subefs.subcat = subcategory;
        subefs.cat2Length = subcategory.length

        row += subcategory.length
        category.push(subefs)
      }

    }
    return {
      category: category,
      numOfRows: row
    };

  }


  public assignsubdefra(data: any, facType: string) {

    let category: any[] = [];
    let row = 0

    for (let i = 0; i < data.length; i++) {

      let subefs = new subeftestDto();

      let dataobj1 = new subefDto();
      let dataobj2 = new subefDto();
      let dataobj3 = new subefDto();
      let dataobj4 = new subefDto();
      let dataobj5 = new subefDto();
      let dataobj6 = new subefDto();
      let dataobj7 = new subefDto();

      let subcategory: any[] = [];


      if (data[i].factorType == facType) {

        subefs.name = data[i].name

        dataobj1.name = "Re-use";
        dataobj1.quantity = this.thousandSeperate(this.checkVal(data[i].reUse), 6);
        dataobj1.unit = "";

        dataobj2.name = "Open loop";
        dataobj2.quantity = this.thousandSeperate(this.checkVal(data[i].openLoop), 6);
        dataobj2.unit = "";

        dataobj3.name = "Closed-loop";
        dataobj3.quantity = this.thousandSeperate(this.checkVal(data[i].closedLoop), 6);
        dataobj3.unit = "";

        dataobj4.name = "Combusion";
        dataobj4.quantity = this.thousandSeperate(this.checkVal(data[i].combution), 6) ;
        dataobj4.unit = "";
        
        dataobj5.name = "Composting";
        dataobj5.quantity = this.thousandSeperate(this.checkVal(data[i].composting), 6) ;
        dataobj5.unit = "";

        dataobj6.name = "Landfill";
        dataobj6.quantity = this.thousandSeperate(this.checkVal(data[i].landFill), 6) ;
        dataobj6.unit = "";

        dataobj7.name = "Anaerobic digestion";
        dataobj7.quantity = this.thousandSeperate(this.checkVal(data[i].AnaeriobicDigestions), 6) ;
        dataobj7.unit = "";

        subcategory.push(dataobj1, dataobj2,dataobj3,dataobj4,dataobj5,dataobj6,dataobj7);

        subefs.subcat = subcategory;
        subefs.cat2Length = subcategory.length

        row += subcategory.length
        category.push(subefs)

      }

    }
    return {
      category: category,
      numOfRows: row
    };

  }


  public assignsubfw(data: any, facType: string, otherTypes) {

    let category: any[] = [];
    let row = 0


    for (let i = 0; i < data.length; i++) {
      let subefs = new subeftestDto();

      let dataobj1 = new subefDto();
      let dataobj2 = new subefDto();
      let dataobj3 = new subefDto();
      let dataobj4 = new subefDto();
     
      let subcategory: any[] = [];


      if (data[i].factorType == facType) {

        let activity = otherTypes.find(o => o.code === data[i].activity)
        let type = otherTypes.find(o => o.code === data[i].type)
        let size = otherTypes.find(o => o.code === data[i].size)

        let name = ((activity !== undefined) ? activity.name : data[i].activity) + "-" +
          ((type !== undefined) ? type.name : data[i].type) + "-"+
         ( (size !== undefined) ? size.name : data[i].size)

        subefs.name = name

        dataobj1.name = "kg CO₂e";
        dataobj1.quantity = this.thousandSeperate(this.checkVal(data[i].kgco2e), 6) ;
        dataobj1.unit = "";

        dataobj2.name = "kg CO₂";
        dataobj2.quantity = this.thousandSeperate(this.checkVal(data[i].kgco2), 6) ;
        dataobj2.unit = "";

        dataobj3.name = "kg CH₄";
        dataobj3.quantity = this.thousandSeperate(this.checkVal(data[i].kgch4), 6) ;
        dataobj3.unit = "";

        dataobj4.name = "kg N₂O";
        dataobj4.quantity = this.thousandSeperate(this.checkVal(data[i].kgn20), 6) ;
        dataobj4.unit = "";
        
     

        subcategory.push(dataobj1, dataobj2,dataobj3,dataobj4);

        subefs.subcat = subcategory;
        subefs.cat2Length = subcategory.length

        row += subcategory.length
        category.push(subefs)

      }

    }
    return {
      category: category,
      numOfRows: row
    };

  }

  public async getGWPValues(projectId: number ){
    await this.setToken()
    const url = `${ES_URL}/common-emission-factor/get-common-ef`

    const queryRunner = getConnection().createQueryRunner()
    try {
      await queryRunner.connect();
      // await queryRunner.startTransaction();
      let p = queryRunner.manager.getRepository(Project)
        .createQueryBuilder('p')
        .leftJoinAndSelect(
          'p.ownerUnit',
          'unit',
          'unit.id = p.ownerUnit'
        )
        .leftJoinAndSelect(
          'unit.country',
          'country',
          'country.id = unit.country'
        )
        .where('p.id = :id', { id: projectId })
      let project = await p.getOne();
      let data = {
        "year": project.year,
        "countryCode": project.ownerUnit.country.code,
        "codes": ['gwp_co2', 'gwp_ch4', 'gwp_n2o']
      }
      let factor = (await this.httpService.post(url, data,this.apiConfig).toPromise()).data
      factor = factor.map(fac => {
        fac.value = this.thousandSeperate(this.checkVal(fac.value), 2)
        fac["factorType"] = "common"
        return fac
      })
      return factor
    } catch (error) {
      console.log(error)
    }finally{
      queryRunner.release()
    }
  }

  checkVal(value: number){
    if (value < 0){
      return '-'
    } else if (Number.isNaN(value)){
      return '-'
    } else {
      return value
    }
  }

  thousandSeperate(value: any, decimals: number){
    if ((value !== undefined)) {
      if (value === '-'){
        return value
      } else if (isNull(value)) {
        return '-'
      } else {
        return parseFloat(value.toFixed(decimals)).toLocaleString('en')
      }
    } else {
      return '-'
    }
  }

  getReference(ref: string){
    if (ref !== undefined){
      if (ref === null || ref === 'null'){
        return '-'
      } else {
        return ref
      }
    } else {
      return '-'
    }
  }
}
