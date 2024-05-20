import { Role } from './role.enum';

export class UserDto {
  id: number;
  username: string;
  role: Role;
  firstName: string;
  lastName: string;
}
