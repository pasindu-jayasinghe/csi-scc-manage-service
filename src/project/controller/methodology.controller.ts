import { Controller, Post, Body, UseGuards } from '@nestjs/common';

import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Methodology } from '../entities/methodology.entity';
import { MethodologyService } from '../service/methodology.service';


@Crud({
  model: {
    type: Methodology,
  },
  query: {
    join: {
      projectType: {
        eager: true,
      },
    },

  },
})

@UseGuards(JwtAuthGuard)
@Controller('methodology')
export class MethodologyController implements CrudController<Methodology>{

  constructor(
    public service: MethodologyService,
    private readonly MethodologyService: MethodologyService) {}

    get base(): CrudController<Methodology> {
      return this;
    }


  @Post('')
  create(@Body() createMethodologyDto: Methodology) {
    return this.MethodologyService.create(createMethodologyDto);
  }

  // // @Get()
  // // findAll() {
  // //   return this.MethodologyService.findAll();
  // // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.MethodologyService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateMethodologyDto: UpdateMethodologyDto) {
  //   return this.MethodologyService.update(+id, updateMethodologyDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.MethodologyService.remove(+id);
  // }


 

}
