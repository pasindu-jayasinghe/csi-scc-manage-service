export abstract class ProgressRetriever{
    abstract getProgressData(projectId: number, unitIds: number[]);
    abstract getActivityData(filter: any, filterValues: any);
    abstract generateTableData(projectId: number, unitIds: number, paras:any[], ownership?:string)
}