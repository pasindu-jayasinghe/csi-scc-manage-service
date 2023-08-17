import { sourceName } from "src/emission/enum/sourcename.enum"


export class sectorES {
    common = [sourceName.Boilers, sourceName.cooking_gas, sourceName.Electricity, sourceName.FireExtinguisher, sourceName.freight_offroad,
        sourceName.freight_rail, sourceName.freight_road, sourceName.Municipal_water, sourceName.offroad_machinery,
        sourceName.passenger_offroad, sourceName.passenger_rail, sourceName.passenger_road, sourceName.Refrigerant,
        sourceName.Waste_water_treatment, sourceName.WeldingEs, sourceName.Generator, sourceName.t_n_d_loss]
    fuelFactors = [sourceName.freight_offroad, sourceName.freight_rail, sourceName.freight_road, sourceName.freight_water,
        sourceName.Generator, sourceName.offroad_machinery, sourceName.passenger_offroad, sourceName.passenger_rail,
        sourceName.passenger_road]
    fuelSecification = [sourceName.Boilers, sourceName.cooking_gas, sourceName.freight_offroad, sourceName.freight_rail,
        sourceName.freight_road, sourceName.Generator, sourceName.offroad_machinery, sourceName.passenger_offroad,
        sourceName.passenger_rail, sourceName.passenger_road]
    fuelPrice = [sourceName.freight_offroad, sourceName.freight_rail, sourceName.freight_road, sourceName.passenger_offroad, 
        sourceName.passenger_road, sourceName.passenger_rail]
    transport = [sourceName.passenger_road]
    freight_water = [sourceName.freight_water]
    defra = [sourceName.waste_disposal]
}

export class commonEFParas {
    boiler = ['fuelType', 'common'] //gwp, (ef_co2_, ef_ch4_, ef_n2o_) + fuleType
    cooking_gas = ['gasType', 'common']//gwp, (ef_co2_, ef_ch4_, ef_n2o_) + gasType
    electricity = ['electricity'] //EF_GE
    t_n_d_loss = ['t_n_d_loss'] //TD_LOSS
    fire_extinguisher = ['common'] //gwp
    freight_rail = ['common'] //gwp
    freight_offroad = ['common'] //gwp
    freight_road = ['cargoType', 'common'] //gwp
    generator = ['common']
    municipal_water = ['water'] //EF_GE,CF_MW
    offroad_machinery_offroad = ['common'] //gwp
    passenger_offroad = ['common'] //gwp
    passenger_rail = ['common'] //gwp
    passenger_road = ['common'] //gwp
    refrigerant = ['gWP_RG'] //GWP_RG_ + gWP_RG
    waste_water_treatment = ['anaerobicDeepLagoon']
    welding_es = ['welding'] //ACEYTELENE_FACTOR, LIQUIDCO2_FACTOR   
}

export const currencies = ["LKR", "USD"]