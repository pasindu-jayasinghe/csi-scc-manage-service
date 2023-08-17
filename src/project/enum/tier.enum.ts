export enum Tier{
    ONE = "ONE",
    TWO = "TWO",
    THREE = "THREE"
}

export namespace Tier {
    export function toString(mode: Tier): string {
        return Tier[mode];
    }

    export function getkey(value: string): Tier{
        switch(value){
            case 'ONE':
                return Tier.ONE;
            case 'TWO':
                return Tier.TWO;
            case 'THREE':
                return Tier.THREE;
        }
    }
}
