import { Clasification } from "../enum/clasification.enum";
import { Tier } from "../enum/tier.enum";


export class EmissionSourceListOfProjectUnit {
    projetUnitId: number;
    emissionSourceIds: number[];
    emissionSourceList: NewPUES[]
}



class NewPUES{
    esId: number;
    tier: Tier;
    clasification: Clasification
}