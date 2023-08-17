import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { AirPortsDis } from '../entities/air-ports.entity';

@Injectable()
export class AirPortDisService extends TypeOrmCrudService<AirPortsDis>{

  constructor(@InjectRepository(AirPortsDis) repo) {
    super(repo);
  }


  async findbyPortCodes(codes: any) {
    console.log(codes)
    let tDistance = 0;
    for (var code in codes) {
      if (codes[+code + 1] != undefined) {

        let dis = null

        dis = await this.repo.findOne({
          where: {
            code1: codes[code], code2: codes[+code + 1]

          },

        })

        if (dis == undefined) {

          dis = await this.repo.findOne({
            where: {
              code1: codes[+code + 1], code2: codes[code]

            },
          })

        }
        try {
          tDistance += dis.distance

        } catch (error) {
          return codes[code] + " to " + codes[+code + 1] + " Not Available"
        }
      }
    }
    return tDistance;

  }


}
