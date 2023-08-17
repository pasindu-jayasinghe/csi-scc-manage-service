import { Project } from "../entities/project.entity"

export class OrgEmissionDto {
    activeYear: number
    emissions: EmissionsDto[] | EsEmissionsDto[]
}

export class EmissionsDto {
    year: string
    direct: number
    indirect: number
    other: number
}
 
export class EsEmissionsDto {
    es: string
    name: string
    emission: number
}

export class ActiveClosedProjectDto {
    active: number
    closed: number
}

export class EmissionSumDto {
    sum: any
    activeYear: string
}