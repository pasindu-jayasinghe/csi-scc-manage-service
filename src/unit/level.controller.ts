import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';

import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { Unit } from './entities/unit.entity';
import { Level } from './entities/level.entity';
import { LevelService } from './level.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';


@Crud({
  model: {
    type: Level,
  },
  query: {
    join: {
    
    },

  },
})
@UseGuards(JwtAuthGuard)
@Controller('level')
export class LevelController implements CrudController<Level>{
  constructor(public service: LevelService) {}




  

}
