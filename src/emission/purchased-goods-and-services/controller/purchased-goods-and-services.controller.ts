import { Controller, Get, Post, Body, Patch, Param, Delete, Query, InternalServerErrorException } from '@nestjs/common';
import { PurchasedGoodsAndServicesActivityData } from '../entities/purchased-goods-and-services.entity';
import { PurchasedGoodsAndServicesService } from '../service/purchased-goods-and-services.service';
import { Crud, CrudController } from '@nestjsx/crud';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePurchasedGoodsAndServiceDto } from '../dto/create-purchased-goods-and-service.dto';

@Crud({
  model: {
    type: PurchasedGoodsAndServicesActivityData,
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
@Controller('purchased-goods-and-services')
export class PurchasedGoodsAndServicesActivityDataController implements CrudController<PurchasedGoodsAndServicesActivityData>{
  constructor(
    public service: PurchasedGoodsAndServicesService,
    @InjectRepository(PurchasedGoodsAndServicesActivityData)
    private readonly purchasedGoodsAndServicesRepository: Repository<PurchasedGoodsAndServicesActivityData>,
  ) { }

  get base(): CrudController<PurchasedGoodsAndServicesActivityData> {
    return this;
  } 

  // @Post()
  // async create(@Body() createDto: CreatePurchasedGoodsAndServiceDto) {
  //   return await this.service.create(createDto.create);
  // }

  @Post('create')
  async createPurchasedGoodAndServices(@Body() createDto: CreatePurchasedGoodsAndServiceDto) {
    return await this.service.create(createDto);
  }

  // @Get()
  // findAll() {
  //   return this.service.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.service.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateDto: PurchasedGoodsAndServicesActivityData[]) {
  //   return this.service.update(+id, updateDto);
  // }

  @Get('get-all-purchase-good-and-services-data')
  getAllPurchaseGoodAndServicesData(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('projectId') projectId: number,
    @Query('unitId') unitId: number
  ): Promise<any> {

    console.log("getAllPurchaseGoodAndServicesData controller")
    try {
      return this.service.getAllPurchaseGoodAndServicesData({ limit: limit, page: page, }, projectId, unitId);
    } catch (e) {
      console.log("eror######", e)
      throw new InternalServerErrorException(e);
    }
  }

  @Get('get-one-purchase-good-and-services-data/group-number-set')
  getOnePurchasedGoodAndServicesDataSet(
    @Query('groupNumber') groupNumber: string,
    @Query('isView') isView: string
  ): Promise<any> {
    return this.service.getOnePurchaseGoodAndServicesDataSet(groupNumber, isView);
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
