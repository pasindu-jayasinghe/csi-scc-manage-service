import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MitigationService } from '../service/mitigation.service';
import { Crud, CrudController } from '@nestjsx/crud';
import { Mitigation } from '../entities/mitigation.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: Mitigation,
  },
  query: {
    join: {
      project: {
        eager: true,
      },
      unit: {
        eager: true,
      }
      
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('mitigation')
export class MitigationController implements CrudController<Mitigation>{
  constructor(
    public service: MitigationService,
    @InjectRepository(Mitigation)
    private readonly mitigationRepository: Repository<Mitigation>,
    ) {}

    get base(): CrudController<Mitigation> {
      return this;
    }
  

  @Post()
  create(@Body() createMitigationDto: Mitigation):Promise<Mitigation> {
    return this.service.create(createMitigationDto);
  }

  // @Get()
  // findAll() {
  //   return this.mitigationService.findAll();
  // }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Mitigation> {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMitigationDto: Mitigation) {
    return this.service.update(+id, updateMitigationDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.mitigationService.remove(+id);
  // }
}
