import { Scope } from "../entities/project-unit-emission-source.entity";
import { Clasification } from "../enum/clasification.enum";
import { Tier } from "../enum/tier.enum";


export class EmissionSourceOfProjectUnit {
    projetUnitId: number;
    emissionSourceId: number;
    tier: Tier;
    scope: Scope;
    clasification: Clasification;
    mobile: boolean;
    stationery: boolean;
    
}