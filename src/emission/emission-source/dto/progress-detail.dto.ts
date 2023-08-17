import { sourceName } from "src/emission/enum/sourcename.enum"

export class ProgressDetailDto{
    projectId: number
    unitId: number
    esCode: sourceName
    parameters: any[] //{name: string, code:stiring}
    isEc?: boolean
    ecDetails?: any
}