import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
  } from '@nestjs/common';
  import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
  
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
import { GeneratorActivityData } from '../entities/generator.entity';
import { GeneratorService } from '../service/generator.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
  
  @Crud({
    model: {
      type: GeneratorActivityData,
    },
    query: {
      join: {
        project: {
          eager: true,
        },
        unit: {
          eager: true,
        },
        user: {
          eager: true,
        }
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Controller('generator')
  export class GeneratorActivityDataController implements CrudController<GeneratorActivityData> {
    constructor(
      public service: GeneratorService,
      @InjectRepository(GeneratorActivityData)
      private readonly elecRepository: Repository<Generator>,
    ) {}
  
    get base(): CrudController<GeneratorActivityData> {
      return this;
    }
  
    @Post()
    create(@Body() createProjectDto: GeneratorActivityData): Promise<GeneratorActivityData> {
      return this.service.create(createProjectDto);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string): Promise<GeneratorActivityData> {
      return this.service.findOne(+id);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProjectDto: GeneratorActivityData) {
      return this.service.update(+id, updateProjectDto);
    }
    
    // @Delete(':id')
    // remove(@Param('id') id: string) {
    //   return this.service.remove(+id);
    // }

    @Override()
    async deleteOne(
      @ParsedRequest() req: CrudRequest,
    ) {
      return await this.service.remove(req)
    }
  }
  