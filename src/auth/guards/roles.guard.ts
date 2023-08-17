
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { LoginRole } from '../constants';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {


        const requiredRoles = this.reflector.getAllAndOverride<LoginRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const req = context.switchToHttp().getRequest();

        if(!req.user){
           return true; 
        }
        if(requiredRoles.length === 0){
            return true;
        }
        return requiredRoles.some((role) => req.user.roles.some((r: LoginRole)=>r===role));
    }

}