import { User } from "../user.entity";

export class UserWithLoginProfileDto {
  user: User;
  userName: string;
  roles: string[]; 
  profileState: number;
}
