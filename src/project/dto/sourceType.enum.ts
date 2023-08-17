export enum SourceType{
    MOBILE='M',
    STATIOANRY='S',
    BOTH = 'B'
}
export namespace SourceType {
    export function toString(mode: SourceType): string {
        return SourceType[mode];
    }

    export function getkey(value: string): SourceType{
        switch(value){
            case 'B':
                return SourceType.BOTH;
            case 'M':
                return SourceType.MOBILE;
            case 'S':
                return SourceType.STATIOANRY;
        }
    }
}
