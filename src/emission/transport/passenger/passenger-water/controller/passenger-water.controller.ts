import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Repository } from 'typeorm';
import { PassengerWaterActivityData } from '../entities/passenger-water.entity';
import { PassengerWaterService } from '../service/passenger-water.service';

@Crud({
  model: {
    type: PassengerWaterActivityData,
  },
  query: {
    join: {
      project: {
        eager: true,
      },
      user: {
        eager: true,
      },
      unit: {
        eager: true,
      }
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('passenger-water')
export class PassengerWaterController implements CrudController<PassengerWaterActivityData>{
  constructor(
    public service: PassengerWaterService,
    @InjectRepository(PassengerWaterActivityData)
    private readonly passengerWaterRepository: Repository<PassengerWaterActivityData>
  ) { }

  get base(): CrudController<PassengerWaterActivityData> {
    return this;
  }

  @Post()
  create(@Body() createDto: PassengerWaterActivityData): Promise<PassengerWaterActivityData> {
    return this.service.create(createDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PassengerWaterActivityData> {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: PassengerWaterActivityData) {
    return this.service.update(+id, updateDto);
  }

  @Override()
  async deleteOne(
    @ParsedRequest() req: CrudRequest,
  ) {
    return await this.service.remove(req)
  }
}
