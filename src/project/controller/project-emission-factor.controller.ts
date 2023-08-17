import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { efSDto } from 'src/report/dto/efstaDto.sto';
import { ProjectEmissionFactorService } from '../service/project-emission-factor.service';

@UseGuards(JwtAuthGuard)
@Controller('project-emission-factor')
export class ProjectEmissionFactorController {
  efs: {};

  constructor(
    private service: ProjectEmissionFactorService
  ) { }

  @Post('get-emission-factors')
  async getEmissionFactors(@Query('esCodes') esCodes: string[], @Query('projectId') projectId: number){
    return await this.service.getEmissionFactors(esCodes, projectId)
  }


  @Post('get-emission-factors-report')
  async getCommonEmissionFactors(@Body() req: { esCodes: string[], projectId: number, facType: string }) {
    let emArry = await this.service.getEmissionFactors(req.esCodes, req.projectId)

   //return emArry

    let ary: any[] = [];
    let facType = req.facType;

    for (let i = 0; i < emArry.length; i++) {
      let row = emArry[i].data.length;
      let efs = new efSDto();

      efs.es = emArry[i].es;
      efs.noOfCat = 1;

      switch (facType) {
        case "common": {
          efs.numOfRow = row;
          efs.category1 = (this.service.assignsub(emArry[i].data, facType)).category;
          break;
        }
        // case "fuelFactor": {
        //   efs.numOfRow = emArry[i].data.filter((obj) => {
        //     return obj.factorType === facType;
        //   }).length * 9;
        //   efs.category1 = (this.service.assignsubfuel(emArry[i].data, facType)).category;
        //   break;
        // }

        // case "fuelSpecific": {
        //   efs.numOfRow = emArry[i].data.filter((obj) => {
        //     return obj.factorType === facType;
        //   }).length * 2;

        //   efs.category1 = (this.service.assignsubfuelsp(emArry[i].data, facType)).category;
        //   break;
        // }
        case "transport": {
          efs.numOfRow = emArry[i].data.filter((obj) => {
            return obj.factorType === facType;
          }).length * 5;
          efs.category1 = (this.service.assignsubtrans(emArry[i].data, facType)).category;
          break;
        }

        case "defra": {
          efs.numOfRow = emArry[i].data.filter((obj) => {
            return obj.factorType === facType;
          }).length * 7;
          efs.category1 = (this.service.assignsubdefra(emArry[i].data, facType)).category;
          break;
        }

        // case "freight_water": {
        //   efs.numOfRow = emArry[i].data.filter((obj) => {
        //     return obj.factorType === facType;
        //   }).length * 4;
        //   efs.category1 = (this.service.assignsubfw(emArry[i].data, facType)).category;
        //   break;
        // }
        default: {
          //statements; 
          break;
        }


      }
      ary.push(efs);


      return ary
    }


  }
}