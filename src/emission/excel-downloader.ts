export abstract class ExcelDownloader{
    abstract getActivityData(filter: any, filterValues: any);
    abstract getVariableMapping()
}