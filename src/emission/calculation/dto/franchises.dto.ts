import { BaseDataDto } from "./emission-base-data.dto";

export class FranchisesDto<T> {

    month: number;


    year: number;


    method: string;

    data: T;

    groupNumber: string;
    emission: number;

    baseData: BaseDataDto;
}