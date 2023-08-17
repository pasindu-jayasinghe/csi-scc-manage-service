import { Clasification } from "src/project/enum/clasification.enum";
import { Tier } from "src/project/enum/tier.enum";
import { Industry } from "src/unit/entities/industry.entity";
import { SourceType } from "./sourceType.enum";

export class PuesDataDto {
    clasification: Clasification;
    tier: Tier;
    sourceType: SourceType;
    industry: Industry;
    countryCode: string;
}

