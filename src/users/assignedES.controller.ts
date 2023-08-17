import {Body, Controller, Get, InternalServerErrorException, Post, Query, UseGuards} from '@nestjs/common';

import {Crud,CrudController} from '@nestjsx/crud';
import { LoginRole } from 'src/auth/constants';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthService } from 'src/auth/service/auth.service';
import { UnitService } from 'src/unit/unit.service';


import { AssignedES } from './assignedES.entity';
import { AssignedESService } from './assignedES.service';

@Crud({
  model: {
    type: AssignedES,
  },
  query: {
    join: {    
      pues: {
        eager: true //this must be true
      },
      user: {
        eager: true //this must be true
      }
    },

    // this works
    // filter: {
    //   id: {
    //     $eq: 1,
    //   }
    // }
  },
})
@UseGuards(JwtAuthGuard)
@Controller('assigned-ES')
export class AssignedESsController implements CrudController<AssignedES> {
  constructor(
    public service: AssignedESService,
    private unitService: UnitService,
    private authService: AuthService
  ) {}

  get base(): CrudController<AssignedES> {
    return this;
  }

}
