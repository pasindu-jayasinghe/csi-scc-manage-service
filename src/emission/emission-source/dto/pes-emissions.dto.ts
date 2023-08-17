import { EmissionSource } from "../entities/emission-source.entity"

export class PesEmissionsDto {
    total: number
    direct: number
    indirect: number
    other: number
    es: EmissionSource
}