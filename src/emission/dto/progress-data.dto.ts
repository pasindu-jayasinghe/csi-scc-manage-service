export class ProgressDataResponseDto{
    unitName: string
    emissionSource: string
    completeness: Completeness
}

export enum Completeness{
    COMPLETED = 'COMPLETED',
    PARTIAL = 'PARTIAL',
    NOT_ENTERED = 'NOT_ENTERED'
}