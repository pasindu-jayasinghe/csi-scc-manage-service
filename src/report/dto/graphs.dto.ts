import { ComparisonGraphDto } from "./comparison-graph.dto";
import { ExicutiveSummeryGraphDto } from "./exicutive-summery-graph.dto";
import { ResultGraphDto } from "./result-graph.dto";

export class GraphsDto {
    exicutiveSummery: ExicutiveSummeryGraphDto;
    result: ResultGraphDto;
    comparison: ComparisonGraphDto;
    data: any;
}