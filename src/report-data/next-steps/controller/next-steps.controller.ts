import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { NextStepsService } from '../service/next-steps.service';
import { Crud, CrudController } from '@nestjsx/crud';
import { NextStep } from '../entities/next-step.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: NextStep,
  },
  query: {
    join: {
      
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('next-steps')
export class NextStepsController implements CrudController<NextStep>{
  constructor(
    public service: NextStepsService,
    @InjectRepository(NextStep)
    private readonly nextStepsRepository: Repository<NextStepsService>
    ) {}

    get base(): CrudController<NextStep> {
      return this;
    }

  @Post()
  create(@Body() createNextStepDto: NextStep):Promise<NextStep> {
    return this.service.create(createNextStepDto);
  }

  // @Get()
  // findAll() {
  //   return this.service.findAll();
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNextStepDto: NextStep) {
    return this.service.update(+id, updateNextStepDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.service.remove(+id);
  // }
}
