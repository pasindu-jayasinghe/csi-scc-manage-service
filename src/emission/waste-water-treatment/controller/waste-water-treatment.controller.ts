import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { WasteWaterTreatmentService } from '../service/waste-water-treatment.service';

import { WasteWaterTreatmentDto } from 'src/emission/calculation/dto/waste-water-treatment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm-next';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { WasteWaterTreatmentActivityData } from '../entities/waste-water-treatment.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: WasteWaterTreatmentActivityData,
  },
  query: {
    join: {
      project: {
        eager: true,
      },
      user: {
        eager: true,
      },
      unit:{
        eager: true
      }
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('waste-water-treatment')
export class WasteWaterTreatmentActivityDataController implements CrudController<WasteWaterTreatmentActivityData>{
  constructor(
    public service: WasteWaterTreatmentService,
    @InjectRepository(WasteWaterTreatmentActivityData)
    private readonly wasteWaterRepository: Repository<WasteWaterTreatmentActivityData>,
    ) {}

    get base(): CrudController<WasteWaterTreatmentActivityData> {
      return this;
    }

  @Post()
  create(@Body() createWasteWaterTreatmentDto: WasteWaterTreatmentActivityData): Promise<WasteWaterTreatmentActivityData> {
    return this.service.create(createWasteWaterTreatmentDto);
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
  update(@Param('id') id: string, @Body() updateWasteWaterTreatmentDto: WasteWaterTreatmentActivityData) {
    return this.service.update(+id, updateWasteWaterTreatmentDto);
  }

  @Override()
  async deleteOne(
    @ParsedRequest() req: CrudRequest,
  ) {
    return await this.service.remove(req)
  }

}
