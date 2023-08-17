export enum Ownership{
    OWN = "Own",
    HIRED = "Hired",
    RENTED = "Rented",
    OTHER = "Other",
}

export namespace Ownership {
    export function toString(mode: Ownership): string {
        return Ownership[mode];
    }

    export function getkey(value: string): Ownership{
        switch(value){
            case 'Own':
                return Ownership.OWN;
            case 'Hired':
                return Ownership.HIRED;
            case 'Rented':
                return Ownership.RENTED;
            case 'Other':
                return Ownership.OTHER;
        }
    }
}
