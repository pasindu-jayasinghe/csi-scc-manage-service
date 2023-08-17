import { ProjectEmissionSource } from "src/emission/emission-source/entities/project-emission-source.entity";
import { Methodology } from "../entities/methodology.entity";
import { ProjectType } from "../entities/project-type.entity";
import { ProjectUnit } from "../entities/project-unit.entity";

export class CreateProjectDto {
    name: string;
    projectEmissionSources: ProjectEmissionSource[]
    projectUnits: ProjectUnit[]
    projectType: ProjectType;
    methodology: Methodology;
}
