import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Parameter } from '../entities/parameter.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Crud, CrudController } from '@nestjsx/crud';
import { ParameterService } from '../service/parameter.service';
import { ManyParameterDto } from '../dto/many-parameter.dto';
import { ManyParameterResDto } from '../dto/many-parameter-res.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: Parameter,
  },
  query: {
    join: {
      source: {
        eager: true,
      }
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('parameter')
export class ParameterController implements CrudController<Parameter>{
  constructor(
    public service: ParameterService,
    @InjectRepository(Parameter)
    private readonly evidenceRepository: Repository<Parameter>) { }

    get base(): CrudController<Parameter> {
      return this;
    }
    @Get(':id')
    findOne(@Param('id') id: string): Promise<Parameter> {
      return this.service.findOne(+id);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProjectDto: Parameter) {
      return this.service.update(+id, updateProjectDto);
    }

    @Post('seed')
    async seed(){
      this.service.seed();
    }

    @Post('get-many-paramters-by-es-list')
    async getManyParamtersByESList( @Body() req: ManyParameterDto): Promise<ManyParameterResDto>{
      return await this.service.getManyParamtersByESList(req);
    }
}
