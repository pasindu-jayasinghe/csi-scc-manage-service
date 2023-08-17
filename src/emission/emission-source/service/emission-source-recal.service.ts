import { Injectable } from "@nestjs/common";
import { sourceName } from "src/emission/enum/sourcename.enum";
import { RecordStatus } from "src/shared/entities/base.tracking.entity";
import { In } from "typeorm";
import { CrudRequest } from '@nestjsx/crud';

@Injectable()
export class EmissionSourceRecalService  {
  constructor( ) {}


  async bulkDelete(ids: number[], isPermant: boolean,service: any) {
    try{
      if(isPermant){
        await Promise.all(ids.map(async id => {
          let req: CrudRequest = {
            parsed: {
              fields: [],
              paramsFilter: [ { field: 'id', operator: '$eq', value: id } ],
              authPersist: undefined,
              search: { '$and': [] },
              filter: [],
              or: [],
              join: [],
              sort: [],
              limit: undefined,
              offset: undefined,
              page: undefined,
              cache: undefined,
              includeDeleted: undefined
  
            },
            options: {
              query: {
                alwaysPaginate: false,
                join: {
                  project: { eager: true },
                  user: { eager: true },
                  unit: { eager: true }
                }
              },
              params: { id: { field: 'id', type: 'number', primary: true } },
              routes: {
                getManyBase: { interceptors: [], decorators: [] },
                getOneBase: { interceptors: [], decorators: [] },
                createOneBase: { interceptors: [], decorators: [], returnShallow: false },
                createManyBase: { interceptors: [], decorators: [] },
                updateOneBase: {
                  interceptors: [],
                  decorators: [],
                  allowParamsOverride: false,
                  returnShallow: false
                },
                replaceOneBase: {
                  interceptors: [],
                  decorators: [],
                  allowParamsOverride: false,
                  returnShallow: false
                },
                deleteOneBase: { interceptors: [], decorators: [], returnDeleted: false },
                recoverOneBase: { interceptors: [], decorators: [], returnRecovered: false }
              }
            }
          };
          await service.remove(req)
        }))
        return null;
      }else{
        return false; // TODO: impl
      }
    }catch(err){
      console.log("bulkDelete  ",err);
      return {
        status: false, 
        message: "bulkDelete failed for"
      }
    }
  }

  async bulkCalculate( service: any,  unitIds: number[], projectId: number, repo: any, name: sourceName) {
    try{
        let dataList = await repo.find({project: {id: projectId}, unit: {id: In(unitIds)}});
        if(dataList && dataList.length > 0){
          let res = await Promise.all(dataList.map(async data => {
            try{
              let updated = await service.update(data.id, data);
              return {
                id: data.id,
                status: true,
                message: "Recalculation success"
              }
            }catch(err){
              console.log("bulkCalculate - "+name+" - " + data.id, err);
              return {
                id: data.id,
                status: false,
                message: "Recalculation failed"
              }
            }
          }))
          return res;
        }
      }catch(err){
        console.log("bulkCalculate - "+name+" ", err);
        return {
          status: false, 
          message: "Recalculation failed for "+name+""
        }
      }
  }
}
