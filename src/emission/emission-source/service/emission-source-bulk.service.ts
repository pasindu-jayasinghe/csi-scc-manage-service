import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { sourceName } from "src/emission/enum/sourcename.enum";
import { VariableValidationType } from "src/emission/enum/variable-validation-type.enum";
import { ExcellUploadable } from "src/emission/excell-uploadable";
import { EmployeeName } from "src/emission/transport/passenger/passenger-road/entities/employee-names.entity";
import { Project } from "src/project/entities/project.entity";
import { Clasification } from "src/project/enum/clasification.enum";
import { ProjectUnitEmissionSourceService } from "src/project/service/project-unit-emission-source.service";
import { ProjectService } from "src/project/service/project.service";
import { Unit } from "src/unit/entities/unit.entity";
import { UnitService } from "src/unit/unit.service";
import { User } from "src/users/user.entity";
import { Any, In } from "typeorm";
import * as XLSX from 'xlsx';

@Injectable()
export class EmissionSourceBulkService  {
  constructor( 
    private projectUnitEmissionSourceService: ProjectUnitEmissionSourceService,
    private unitService: UnitService,
    private projectService: ProjectService
  ) {}

  /**
   * 
   * 

  validationSheetMap = [
    {"variable": "fuelType","sheetName":"Fuel Types"},
    {"variable": "fc_unit","sheetName":"Fuel Consumption Unit"},
  ]


   * 
   * @param projectId 
   * @param esCode 
   * @param buffer 
   * @param validationSheetMap 
   * @param excelBulkVariableMapping 
   * @returns 
   */

  async excellValidate(
    projectId: number, 
    esCode: sourceName, 
    buffer: Buffer, 
    validationSheetMap: {variable: string, sheetName: string}[],
    excelBulkVariableMapping: {code: string, name: string, isRequired: boolean, type: VariableValidationType}[]
  ){
    console.log("Validate0",buffer)

    const workbook = XLSX.read(buffer);
    console.log("Validate1",workbook)

    let data_sheet = workbook.Sheets['in'];
    console.log("Validate2",data_sheet)
    try{
      if (data_sheet) {      
        let allowedUnits = await this.projectUnitEmissionSourceService.getAllowedUnitsforProjectAndEs(projectId,esCode);;
        let allowedUnitIds = allowedUnits.map((a: { code: any; }) => a.code);
        let errRecords: {row: number, column: string, messages: string[]}[] = [];

        console.log("validate3",allowedUnits)

        let dataSet = XLSX.utils.sheet_to_json(data_sheet);

        Promise.all(dataSet.map(async (d: any, i: number) => {
          let unitId = d['Unit Id'];
          let isAllowed = allowedUnitIds.includes(unitId)
          if(!isAllowed){
            errRecords.push({
              row: i+2,
              column: "Unit Id",
              messages: ["This emission source is not assigned to this unit"]
            })
          }else{
            let allowedData = allowedUnits.find(a => a.code === unitId);
            if(allowedData){
              if(allowedData.clasification === Clasification.ANY && !d['Ownership']){
                errRecords.push({
                  row: i+2,
                  column: "Ownership",
                  messages: ["Ownership is a required because clasification is 'Any'"]
                })
              }

              if(allowedData.mobile && allowedData.stationery && (!d['Is Stationary'] && !d['Is Mobile'])){
                errRecords.push({
                  row: i+2,
                  column: "Is Mobile",
                  messages: ["One of 'Is Stationary', 'Is Mobile' should be filed for this unit"]
                })
              }

              if(allowedData.mobile && allowedData.stationery && (d['Is Stationary'] && d['Is Mobile'])){
                errRecords.push({
                  row: i+2,
                  column: "Is Mobile",
                  messages: ["Only one of 'Is Stationary', 'Is Mobile' should be filed"]
                })
              }
            }
          }
        }))
 
        if(errRecords.length > 0){
          return errRecords;
        }
        

        let supportedListMap = {}
        excelBulkVariableMapping.forEach(vm=>{
          let validation = validationSheetMap.find(v => v.variable === vm.code);
          if(validation){
            let supportedSheet = workbook.Sheets[validation.sheetName];
            if(supportedSheet){
              let supportedData = XLSX.utils.sheet_to_json(supportedSheet);
              if(supportedData){
                let supportedValues = supportedData.map((d: any) => d.code)
                supportedListMap[vm.code] = supportedValues;
              }
            }
          }
        })

        dataSet.forEach((data: any, i: number) => {

          excelBulkVariableMapping.forEach(vm=>{
            let messages: string[] = [];
            if(data[vm.name] !== undefined && data[vm.name] !== null && data[vm.name] !== ''){
              let value = data[vm.name];
              if(value !== undefined && value !== null && value !== ''){
                switch(vm.type){
                  case VariableValidationType.textOrNumber:
                    if (typeof value !== 'number' && typeof value !== 'string'){
                      messages.push("'"+value+"' is not supported!!. This is should be a number or text")
                    }
                    break;
                  case VariableValidationType.bool:
                    if((value !== 0 && value !== 1 ) && (value !== '0' && value !== '1')){
                      messages.push("'"+value+"' is not supported!!. This is should be 1 or 0")
                    }
                    // else if (typeof value !== 'boolean'){
                    //   messages.push("'"+value+"' is not supported!!. This is should be 1 or 0")
                    // }
                    break
                  case VariableValidationType.text:
                    if (typeof value !== 'string'){
                      messages.push("'"+value+"' is not supported!!. This is should be a text")
                    }
                    break
                  case VariableValidationType.number:
                    if (typeof value !== 'number'){
                      messages.push("'"+value+"' is not supported!!. This is should be a number")
                    }
                    break
                  case VariableValidationType.list:
                    let validation = validationSheetMap.find(v => v.variable === vm.code);
                    if(validation){
                      if(supportedListMap[vm.code] && !supportedListMap[vm.code].includes(value)){
                        messages.push( "'"+value+"' is not supported!!. Plese select a value form the sheet  '"+ validation.sheetName + "'");
                        messages.push("Make sure to get the text from the column 'code'")
                      }
                    }                  
                    break
                }
              }else if(vm.isRequired){
                messages.push("This is a required field")
              }
            }
            if(messages.length > 0){
              errRecords.push({
                row: i+2,
                column: vm.name,
                messages: messages
              })
            }
          })

        })

        return errRecords;

      }else {
        console.log("no data_sheet");
        throw new InternalServerErrorException("no data_sheet")
      }
    }catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err)
    }


  }


  async excellBulckValidatedSave(
    project: Project, 
    user: User,
    year: number,
    buffer: Buffer,
    excelBulkVariableMapping: {code: string, name: string}[],
    service: ExcellUploadable
  ){
    console.log("INN")

    const workbook = XLSX.read(buffer);
    let data_sheet = workbook.Sheets['in'];
    console.log("INN--",data_sheet)

    try{
      if (data_sheet) {   
        let dataSet = XLSX.utils.sheet_to_json(data_sheet);
        let unitIds = dataSet.map(data => data["Unit Id"] as number).filter((value, index, array) => array.indexOf(value) === index);
        let units = await this.unitService.find({id: In(unitIds)});
        let errRecords: {row: number, column: string, messages: string[]}[] = [];

        let res = await Promise.all(dataSet.map(async (data: any, i: number) => {
          let dto = service.getDto();
          excelBulkVariableMapping.forEach(vm=>{
            if(data[vm.name] !== undefined && data[vm.name] !== null && data[vm.name] !== ''){
              dto[vm.code] = data[vm.name];
            }
          })

          let ownership = data["Ownership"];
          let unitId = data["Unit Id"];
          let isMobile = data["Is Mobile"] == 1;
          let isStationary = data["Is Stationary"] == 1;
          let paid = data["Paid by the company"] == 1 || data["Paid by the company"] == "1";

          if(dto['paidByCompany']){
            dto['paidByCompany'] = paid;
          }

          dto.ownership=ownership;
          dto.mobile = isMobile;
          dto.stationary = isStationary;
          let unit = units.find(u => u.id === unitId);
          if(unit){
            dto.unit = unit;
          }
          dto.year = year;
          // console.log(i);
          // if(i===1){
          //   dto.year = "year";
          // }
          dto.project=project;
          dto.user = user;


          // if(dto.user === "1"){ // TODO: implement for bult multy unit
          //   let en = new EmployeeName();
        
          //   let name: string = data["Employee Name"] ? data["Employee Name"]: "";
          //   let id: string = data["Employee Id"] ? data["Employee Id"]+"": "";


          //   let empName = name.replace(/\s+/g, '_').toUpperCase();
          //   let unitName = unit.name.replace(/\s+/g, '_').toUpperCase();
          //   let empId = id.replace(/\s+/g, '_').toUpperCase();

          //   en.unit = unit;
          //   en.empId = empId;
          //   en.name = empName;
          //   en.code = empName + "_" + unitName+"_"+empId
          //   try{
          //     // let em = await this.employeeNameService.create(en);
          //     dto.employeeName = en.code;
          //   }catch(err){
          //     dto.employeeName = en.code;
          //   }

          // }

          // console.log(dto);
          try{
            // let saved = null;
            let saved = await service.create(dto);
            if(saved){
              console.log("saved", i+2)
              return null;            
            }else{
              console.log("not saved", i+2)
              errRecords.push({
                row: i+2,
                column: "Error on saving",
                messages: ["Unknown error"]
              })
              return {
                row: i+2,
                column: "Error on saving",
                messages: ["Unknown error"]
              }
            }
          }catch (err) {
            console.log("error in saving",err);
            errRecords.push({
              row: i+2,
              column: "Error on saving",
              messages: [err.message]
            })
            return {
              row: i+2,
              column: "Error on saving",
              messages: [err.message]
            }
          }
        }))

        if(errRecords.length>0){
          console.log("errRecords",errRecords);
          return errRecords;
        }else{
          console.log("No errors",res);
          return res;
        }
      }else {
        console.log("no data_sheet");
        throw new InternalServerErrorException("no data_sheet")
      }
    }catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err)
    }
  }

  excellBulkUpload(
    unit: Unit, 
    project: Project, 
    user: User, 
    data: any, 
    year: number,
    ownership: string, 
    isMobile: boolean,
    dto: any,
    excelBulkVariableMapping: {code: string, name: string}[]
  ) {

    dto.unit = unit;
    dto.project = project;
    dto.user = user;
    dto.year = year;

    excelBulkVariableMapping.forEach(vm=>{
      if(data[vm.name] !== undefined && data[vm.name] !== null && data[vm.name] !== ''){
        dto[vm.code] = data[vm.name];
      }
    })

    if (dto.ownership === null || dto.ownership === undefined){
      dto.ownership = ownership;
    }
    dto.mobile = isMobile;
    dto.stationary = !isMobile;

    let paid = data["Paid by the company"] == 1 || data["Paid by the company"] == "1";
    if(dto['paidByCompany']){
      dto['paidByCompany'] = paid;
    }

    return dto;
  }
}
