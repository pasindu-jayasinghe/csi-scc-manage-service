import {  Injectable } from '@nestjs/common';
import { isNumber } from '@nestjsx/util';
import { retry } from 'rxjs';
import { ProgressStatus } from 'src/emission/enum/progress-status.enum';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { Parameter } from 'src/parameter/entities/parameter.entity';
import { ParameterUnit } from 'src/utills/parameter-units';
import { getConnection } from 'typeorm';

@Injectable()
export class ProgresReportService {

    constructor(
        private parameterUnit: ParameterUnit,
    ){}

    group(list: any[], prop: string | number) {
        return list.reduce((groups, item) => ({
            ...groups,
            [item[prop]]: [...(groups[item[prop]] || []), item]
        }), {});
    }

   /**
    * When criteria checks month with parameters || When criteria checks only month
    * @param acData 
    * @param checkMonths 
    * @param checkEachMonth 
    * @param optional uniqueValues: {paraName: paraValue}
    * @returns 
    */
    checkCompleteness(acData, checkMonths=true, checkEachMonth:boolean, optional?:{para?:string[], esCode?: string, uniquValues?: any[]}){
        let months = this.parameterUnit.months
        months = months.filter(o => o.value !== 12)
        
        let original = [...acData]
        acData = this.group(acData, 'month')
        let acMonths = Object.keys(acData)
        
        let filledMonths = []
        let partialFilledMonths = []
        let unfilledData = []
        
        if (checkMonths){
            if (optional && optional.para){
                
                // let uniqueValues = [...new Set(original.map(item => item[optional.para]))]
                let uniqueValues
                if(optional.uniquValues){
                    uniqueValues = optional.uniquValues
                } else {
                    uniqueValues = this.getUniqueParaCombinations(original, optional.para)
                }
                acMonths.forEach(key => {
                    // let values = [...new Set(acData[key].map(item => item[optional.para]))]
                    let values = this.getUniqueParaCombinations(original, optional.para)
                    // if (uniqueValues.every(e => values.includes(e))){
                    if (this.hasObj(uniqueValues, values)){
                        filledMonths.push(key)
                    } else {
                        // let unfilledValue = uniqueValues.filter(o => !values.includes(o))
                        // unfilledData.push({month:months.find(o => o.value.toString() === key), parameterValue: unfilledValue})
                        partialFilledMonths.push(key)
                    }
                })
            } else {
                acMonths.forEach(key => {
                    acData[key].forEach(ac => {
                        if (ac.month.toString() === key){
                            filledMonths.push(key)
                        }
                    })
                })
            }
    
            // months.map(ele => {
            //     if (!filledMonths.includes(ele.value.toString()) && !partialFilledMonths.includes(ele.value.toString())){
            //         unfilledData.push({month: ele, parameterValue: uniqueValues})
            //     }
            // })
    
    
            if(!optional){
                if (filledMonths.includes('12')){
                    return {
                        isCompleted: ProgressStatus.COMPLETED
                    }
                } else if (filledMonths.length > 0){
                    if (checkEachMonth){
                        if (months.every(elem => filledMonths.includes(elem.value.toString())) ){
                            return {
                                isCompleted: ProgressStatus.COMPLETED
                            }
                        } else {
                            return {
                                isCompleted: ProgressStatus.PARTIAL
                            }
                        }
                    } else {
                        return {
                            isCompleted: ProgressStatus.COMPLETED
                        }
                    }
                } else {
                    return {
                        isCompleted: ProgressStatus.NOT_ENTERED
                    }
                }
            } else {
                if (filledMonths.includes('12')){
                    return {
                        isCompleted: ProgressStatus.COMPLETED
                    }
                } else if (filledMonths.length === 0 && partialFilledMonths.length === 0){
                    return {
                        isCompleted: ProgressStatus.NOT_ENTERED
                    }
                } else if (filledMonths.length > 0){
                    if (checkEachMonth){
                        if (months.every(elem => filledMonths.includes(elem.value.toString())) ){
                            return {
                                isCompleted: ProgressStatus.COMPLETED
                            }
                        } else {
                            return {
                                isCompleted: ProgressStatus.PARTIAL
                            }
                        }
                    } else {
                        return {
                            isCompleted: ProgressStatus.COMPLETED
                        }
                    }
                }
                 else {
                    return {
                        isCompleted: ProgressStatus.PARTIAL,
                        unFilled: unfilledData,
                        filled: filledMonths
                    }
                }
            }
        } else { //refrigerant
            let values = []
            acMonths.forEach(key => {
                values.push(...[...new Set(acData[key].map(item => item[optional.para[0]]))])
            })
            let types = this.getTypeValues(optional.esCode)
            if (types.length !== 0){
                if (types.every(e => values.includes(e))){
                    return {
                        isCompleted: ProgressStatus.COMPLETED
                    }
                } else {
                    return {
                        isCompleted: ProgressStatus.PARTIAL,
                    }
                }
            }
        }
    }

    getTypeValues(esCode){
        if (esCode){
            switch(esCode){
                case sourceName.Refrigerant:
                    return (this.parameterUnit.gWP_RGs.map(e => e.name))
            }
        } else {
            return []
        }
    }

    getUniqueParaCombinations(acData: any, para: string[]){
        let logic = ''
        // para.push('month')
        para.forEach((p, idx) => {
            if (idx == 0){
                logic += 'item[' + '"' + p + '"' + '] === data[' + '"' + p + '"' + ']'
            } else {
                logic += ' && item[' + '"' + p + '"' + '] === data[' + '"' + p + '"' + ']'
            }
        })
        const returned_array = []
        acData.map(data => {
            if (!(returned_array.find(item => eval(logic)))){
                let obj = {}
                para.forEach(p => {
                    obj[p] = data[p]
                })
                returned_array.push(obj);
            }
        })
        return (returned_array);
    }

    hasObj(array, arr){
        return array.every(function (a) {
            return arr.every(obj => {
                var keys = Object.keys(a);
                return keys.length === Object.keys(obj).length && keys.every(function (k) {
                    return a[k] === obj[k];
                });
            })
        });
    }

    calculateSampleSize(population, error, proportion, zScore){
        let n_0 = (Math.pow(zScore, 2) * proportion * (1 - proportion)) / Math.pow(error, 2)
        let sample = n_0 / (1 + (n_0 / population))
        return sample
    }

    getParameterUnit(data: any, code: string) {
        if (data[code] !== null) {
            let unit = data[code + '_unit']
            if (unit) {
                return " " + (this.parameterUnit.parameterUnits[unit]).label
            } else {
                return ''
            }
        } else {
            return ''
        }
    }

    createTableData(acData: any[], row1: any[], additionalCols: any[], mainPara: string,  valuePara: string){
        let months = this.parameterUnit.months
        let columns = []
        let rows = []
        rows.push(row1)
        columns.push(...additionalCols)
        months.forEach(m => {
          columns.push({name: m.name, code: m.value.toString()})
        })
        rows.push(columns)
        let dataObjs = []
        columns.sort((a,b)=> a.code-b.code)
        if (acData.length > 0){
          acData.forEach(data => {
            let exists = dataObjs.findIndex(o => o[mainPara] === (this.getMainParaValue(data[mainPara], mainPara) + this.getParameterUnit(data, mainPara)))
            if (exists === -1){
              let obj = {}
              months.forEach(m => {
                obj = {...obj, ...{[m.value]:0}}
              })
              obj = {...obj, ...{[mainPara]: ''}}
              obj[mainPara] = this.getMainParaValue(data[mainPara], mainPara) + this.getParameterUnit(data, mainPara)
              obj[data.month] = data[valuePara] + this.getParameterUnit(data, valuePara)
                dataObjs.push(obj)
            } else {
                // dataObjs[exists][data.month] = data[valuePara] + this.getParameterUnit(data, valuePara)
                let value = 0
                if (!isNumber(dataObjs[exists][data.month]) || dataObjs[exists][data.month] !== 0) {
                    if ((dataObjs[exists][data.month]).includes(" ")) {
                        value = parseFloat((dataObjs[exists][data.month]).split(" ")[0])
                    } else {
                        value = parseFloat(dataObjs[exists][data.month])
                    }
                }
                dataObjs[exists][data.month] = value + data[valuePara] + this.getParameterUnit(data, valuePara)

              }
          })
        }
        
        return {
          data: dataObjs,
          rows: rows
        }
    }

    getMainParaValue(value, para){
        let types
        let type
        switch(para){
            case 'anaerobicDeepLagoon':
                types = this.parameterUnit.anaerobicDeepLagoons
                type = types.filter(o => o.code === value)
                break;
            case 'wasteType':
                types = this.parameterUnit.disposalWasteTypes
                type = types.filter(o => o.code === value)
                break;
            case 'gasType':
                types = this.parameterUnit.cookingGasTypes
                type = types.filter(o => o.code === value)
                break;
            case 'cargoType':
                types = [...this.parameterUnit.cargoType_road_freightTransport, ...this.parameterUnit.cargoType_shared]
                type = types.filter(o => o.code === value)
                break;
            default:
                type = []
                break;
        }

        if (type.length > 0){
            return type[0].name
        } else {
            return value
        }
    }
    
}


