
import { SetMetadata } from '@nestjs/common';
import { LoginRole } from '../constants';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: LoginRole[]) => SetMetadata(ROLES_KEY, roles);
