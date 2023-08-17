import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Repository } from 'typeorm-next';
import { BusinessTravelActivityData } from '../entities/business-travel.entity';
import { BusinessTravelService } from '../service/business-travel.service';

@Crud({
  model: {
    type: BusinessTravelActivityData,
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
@Controller('business-travel')
export class BusinessTravelActivityDataController implements CrudController<BusinessTravelActivityData>{
  constructor(
    public service: BusinessTravelService,
    @InjectRepository(BusinessTravelActivityData)
    private readonly passengerRoadRepository: Repository<BusinessTravelActivityData>
  ) { }

  get base(): CrudController<BusinessTravelActivityData> {
    return this;
  }

  @Post()
  create(@Body() createProjectDto: BusinessTravelActivityData): Promise<BusinessTravelActivityData> {
    return this.service.create(createProjectDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<BusinessTravelActivityData> {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: BusinessTravelActivityData) {
    return this.service.update(+id, updateProjectDto);
  }

  @Override()
    async deleteOne(
      @ParsedRequest() req: CrudRequest,
    ) {
      return await this.service.remove(req)
    }
}