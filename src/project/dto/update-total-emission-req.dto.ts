import { sourceName } from "src/emission/enum/sourcename.enum";
import { Project } from "../entities/project.entity";
import { Clasification } from "../enum/clasification.enum";

export class PuesSumDataReqDto {
    sourceName: sourceName;
    project: Project;
    unitId: number;
    classification: Clasification;
    emission: any;
}

export class PesSumDataReqDto {
    sourceName: sourceName;
    project: Project;
    classification: Clasification;
    emission: any;
}

export class ProjectSumDataReqDto {
    project: Project;
    classification: Clasification;
    emission: any;
}