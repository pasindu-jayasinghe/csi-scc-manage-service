import { Controller, Get, Post, Body, Patch, Param, Delete, Query, InternalServerErrorException } from '@nestjs/common';
import { CreateNetZeroUseOfSoldProductDto } from '../dto/create-net-zero-use-of-sold-product.dto';
import { NetZeroUseOfSoldProductsService } from '../service/net-zero-use-of-sold-products.service';
import { NetZeroUseOfSoldProductActivityData } from '../entities/net-zero-use-of-sold-product.entity';
import { Crud, CrudController } from '@nestjsx/crud';

@Crud({
  model: {
    type: NetZeroUseOfSoldProductActivityData,
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
@Controller('net-zero-use-of-sold-products')
export class NetZeroUseOfSoldProductsActivityDataController implements CrudController<NetZeroUseOfSoldProductActivityData>{
  constructor(public service: NetZeroUseOfSoldProductsService) { }

  get base(): CrudController<NetZeroUseOfSoldProductActivityData> {
    return this;
  }

  @Post('create')
  async createUseOfSoldProducts(@Body() createDto: CreateNetZeroUseOfSoldProductDto) {
    return await this.service.create(createDto);
  }

  @Get('get-all-use-of-sold-products-data')
  getAllUseOfSoldProductsData(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('projectId') projectId: number,
    @Query('unitId') unitId: number
  ): Promise<any> {
    try {
      return this.service.getAllUseOfSoldProductsData({ limit: limit, page: page, }, projectId, unitId);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  @Get('get-one-use-of-sold-products-data/group-number-set')
  getOneUseOfSoldProductsDataSet(
    @Query('groupNumber') groupNumber: string,
    @Query('isView') isView: string
  ): Promise<any> {
    return this.service.getOneUseOfSoldProductsDataSet(groupNumber, isView);
  }

  @Delete('delete-whole-group')
  async deleteWholeGroup(@Query('groupNumber') groupNumber: string) {
    return await this.service.deleteWholeGroup(groupNumber);
  }

  @Delete('deleteOneRow')
  async deleteOneRow(@Query('id') id: number) {
    return await this.service.removeOneRow(id);
  }
}
