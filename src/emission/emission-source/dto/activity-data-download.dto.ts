import { sourceName } from "src/emission/enum/sourcename.enum"

export class ActivityDataDownloadDto{
    projectId: number
    esCode: sourceName
    optional?: any
}