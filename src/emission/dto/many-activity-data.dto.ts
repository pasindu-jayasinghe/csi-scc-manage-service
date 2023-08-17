import { sourceName } from "../enum/sourcename.enum";

export class ManyActivityDataDto{
     projectId: number;
     unitIds: number[];
     userIds: number[];
     es: sourceName;
     esList: sourceName[];
}