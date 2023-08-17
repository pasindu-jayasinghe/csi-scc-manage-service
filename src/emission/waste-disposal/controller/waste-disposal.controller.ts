import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';import { WasteDisposalService } from '../service/waste-disposal.service';
import { WasteDisposalActivityData } from '../entities/waste-disposal.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: WasteDisposalActivityData,
  },
  query: {
    join: {
      project: {
        eager: true,
      },
      unit:{
        eager: true
      },
      user: {
        eager: true,
      }
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('waste-disposal')
export class WasteDisposalActivityDataController implements CrudController<WasteDisposalActivityData>{
  constructor(
    public service: WasteDisposalService,
    @InjectRepository(WasteDisposalActivityData)
    private readonly wasteDisposalRepository: Repository<WasteDisposalActivityData>,
  ) {}

  get base(): CrudController<WasteDisposalActivityData> {
    return this;
  }
  @Post()
  create(@Body() createWasteDisposalDto: WasteDisposalActivityData):Promise<WasteDisposalActivityData> {
    return this.service.create(createWasteDisposalDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) :Promise<WasteDisposalActivityData>{
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWasteDisposalDto: WasteDisposalActivityData) {
    return this.service.update(+id, updateWasteDisposalDto);
  }

  @Override()
  async deleteOne(
    @ParsedRequest() req: CrudRequest,
  ) {
    return await this.service.remove(req)
  }
}
