import { SourceType } from "src/project/dto/sourceType.enum";
import { Clasification } from "src/project/enum/clasification.enum";
import { Tier } from "src/project/enum/tier.enum";

export class BaseDataDto {
    clasification: Clasification;
    tier: Tier;
    sourceType: SourceType;
    industry: string;
    countryCode: string;
    projectId: number
}