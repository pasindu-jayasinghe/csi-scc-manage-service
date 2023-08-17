import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm-next';
import { TNDLossActivityData } from '../entities/t-n-d-loss.entity';
import { TNDLossService } from '../service/t-n-d-loss.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: TNDLossActivityData,
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
        eager: true
      }
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('t-n-d-loss')
export class TNDLossActivityDataController implements CrudController<TNDLossActivityData>{
  constructor(
    public  service: TNDLossService,
    @InjectRepository(TNDLossActivityData)
    private readonly tndRepository: Repository<TNDLossActivityData>,
    ) {}

    get base(): CrudController<TNDLossActivityData> {
      return this;
    }

    @Post()
    create(@Body() createProjectDto: TNDLossActivityData): Promise<TNDLossActivityData> {
  
      // createProjectDto.activityDataStatus = 
      return this.service.create(createProjectDto);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string): Promise<TNDLossActivityData> {
      return this.service.findOne(+id);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProjectDto: TNDLossActivityData) {
      return this.service.update(+id, updateProjectDto);
    }
  
  
    @Override()
    async deleteOne(
      @ParsedRequest() req: CrudRequest,
    ) {
      return await this.service.remove(req)
    }
}
