import { sourceName } from "src/emission/enum/sourcename.enum";
import { Parameter } from "../entities/parameter.entity";

export class ManyParameterResDto {
    es: sourceName;
    parameters: Parameter[];
}
