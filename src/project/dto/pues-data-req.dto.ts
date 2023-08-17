import { sourceName } from "src/emission/enum/sourcename.enum";
import { Project } from "src/project/entities/project.entity";
import { User } from "src/users/user.entity";
import { Ownership } from "../enum/ownership.enum";

export class PuesDataReqDto {
  sourceName: sourceName;
  project: Project;
  user: User;
  unitId: number; // no need to assign if user is assigned
  activityInfo: PuesDataReqActivityData
}


export class PuesDataReqActivityData {
  owenerShip: Ownership | undefined;
  mobile: boolean = false;
  stationary: boolean = false;
  paidByCompany: boolean | undefined;
}



