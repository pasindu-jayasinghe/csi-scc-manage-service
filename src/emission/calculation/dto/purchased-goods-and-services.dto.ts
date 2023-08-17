import { TransportMode } from "src/emission/enum/transport.enum"
import { BaseDataDto } from "./emission-base-data.dto"
import { PurchasedGoodsAndServicesMethod } from "src/emission/purchased-goods-and-services/enum/purchased-good-and-services-method.enum"
import { AverageData, MaterialData, MaterialTransportData, PurchaseData, SpendData, SupplierData, WasteData, WasteOtherData } from "src/emission/purchased-goods-and-services/dto/create-purchased-goods-and-service.dto"


export class PurchasedGoodsAndServicesDto {
    mode: PurchasedGoodsAndServicesMethod
    data: SupplierData | PurchaseData | MaterialData | MaterialTransportData | WasteData | WasteOtherData | AverageData | SpendData
    year: number
    month: number
    baseData: BaseDataDto
}

