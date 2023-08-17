import { UseOfSoldProductsMethod } from "src/emission/net-zero-use-of-sold-products/enum/use-of-sold-products-method.enum"
import { BaseDataDto } from "./emission-base-data.dto"
import { FuelData, ElectricityData, RefrigerantData, CombustedData, GreenhouseData, IndirectFuelData, IndirectElectricityData, IndirectRefrigerantdata, IndirectGHGData, IntermediateData } from "src/emission/net-zero-use-of-sold-products/dto/create-net-zero-use-of-sold-product.dto"

export class UseOfSoldProductsDto {
    mode: UseOfSoldProductsMethod
    data: FuelData | ElectricityData | RefrigerantData | CombustedData | GreenhouseData | IndirectFuelData | IndirectElectricityData | IndirectRefrigerantdata | IndirectGHGData | IntermediateData
    year: number
    month: number
    baseData: BaseDataDto
}