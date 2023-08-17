import { Inject, Injectable, UseGuards } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { use } from "passport";

@Injectable()
export class ParameterUnit {


    public parameterUnits = {
        KWH: { label: "kWh", code: 'KWH' },
        KG: { label: "kg", code: 'KG' },
        KM: { label: "km", code: 'KM' },
        PKM: { label: "Passenger.km", code: 'PKM' },
        T: { label: "Mt", code: 'T' },
        L: { label: "L", code: 'L' },
        G: { label: "g", code: 'G' },
        M3: { label: "m³", code: 'M3' },
        LKR: { label: "LKR", code: 'LKR' },
        TCO2Y: { label: "tCO₂e/year", code: 'TCO2Y' },
        TYR: { label: "t/yr", code: "TYR" },
        M3T: { label: "m³/t", code: "M3T" },
        KGCODM3: { label: "kgCOD/m³", code: "KGCODM3" },
        KGCODYR: { label: "kgCOD/yr", code: "KGCODYR" },
        KGCH4YR: { label: "kgCH₄/yr", code: "KGCH4YR" },
        KWHNETCV: { label: "kWh (NetCV)", code: 'KWHNETCV' },
        KWHGROSSCV: { label: "kWh (GrossCV)", code: 'KWHGROSSCV' },
        NM: { label: "Nm", code: 'NM' },
        PORT: { label: "port", code: 'PORT' },
        KML: { label: "km/l", code: 'KML' }
    }

    // units
    private _boilers_units: any
    private _fire_extinguisher_units: any
    private _generator_units: any
    private _refrigerant_units: any
    private _welding_units: any
    private _forklifts_units: any
    private _waste_water_units: any
    private _municipal_water_units: any
    private _electricity_units: any
    private _waste_disposal_units: any
    private _cooking_gas_units: any
    private _road_freight_units: any
    private _air_freight_units: any
    private _water_freight_units: any
    private _rail_freight_units: any
    private _passenger_road_units: any
    private _busines_travel_units: any
    private _passenger_offroad_units: any
    private _passenger_rail_units: any
    private _offroad_freight_units: any
    private _offroad_machinery_units: any

    private _months: {name: string, value: number}[] = []

    private _fireExtinguisherTypes: { name: string, id: number, code: string }[] = []
    private _anaerobicDeepLagoons: { name: string, id: number, code: string }[] = []
    private _fuelType: { name: string, id: number, code: string }[] = []
    private _options_passenger_air: { id: number, name: string, code: string }[] = []
    private _class_passenger_air: { id: number, name: string, code: string }[] = []
    private _strokes: { name: string, id: number, code: string }[] = []
    private _cargoType_road_freightTransport: { code: string, name: string, id: number }[] = []
    private _cargoType_shared: { code: string, name: string, id: number }[] = []
    private _gWP_RGs: { name: string, id: number }[] = []

    private _disposalWasteTypes: { name: string, id: number, wasteId: number, code: string; }[] = []
    private _cookingGasTypes: {name: string, id: number, sourceId:number, code: string;}[] = []


    constructor() {
        this.electricity_units = {
            consumption: [this.parameterUnits.KWH]
        }

        this.boiler_units = {
            consumption: [this.parameterUnits.L, this.parameterUnits.KG]
        }

        this.fire_extinguisher_units = {
            weightPerTank: [this.parameterUnits.KG, this.parameterUnits.G]
        }

        this.generator_units = {
            consumption: [this.parameterUnits.L, this.parameterUnits.M3, this.parameterUnits.LKR]
        }

        this.refrigerant_units = {wrg: [this.parameterUnits.KG, this.parameterUnits.G]}

        this.welding_units = {
            ac: [this.parameterUnits.KG],
            lc: [this.parameterUnits.KG]
        }

        this.forklifts_units = {
            consumption: [this.parameterUnits.L]
        }

        this.waste_water_units = {
            tip: [this.parameterUnits.TYR],
            wasteGenerated: [this.parameterUnits.M3T],
            cod: [this.parameterUnits.KGCODM3],
            sludgeRemoved: [this.parameterUnits.KGCODYR],
            recoveredCh4: [this.parameterUnits.KGCH4YR]
        }

        this.municipal_water_units = {
            consumption: [this.parameterUnits.M3, this.parameterUnits.L, this.parameterUnits.LKR],
        }

        this.waste_disposal_units = {
            disposed: [this.parameterUnits.T],
        }

        this.cooking_gas_units = {
            consumption: [this.parameterUnits.KG],
        }

        this.road_freight_units = {
            fuel: [this.parameterUnits.L, this.parameterUnits.M3, this.parameterUnits.LKR],
            distance: [this.parameterUnits.KM, this.parameterUnits.LKR],
            weight: [this.parameterUnits.T],
            fuelEconomy: [this.parameterUnits.KML],
        }

        this.air_freight_units = {
            distance: [this.parameterUnits.KM, this.parameterUnits.LKR],
            weight: [this.parameterUnits.T]
        }

        this.water_freight_units = {
            fuel: [this.parameterUnits.L, this.parameterUnits.T, this.parameterUnits.KWHNETCV, this.parameterUnits.KWHGROSSCV],
            distance: [this.parameterUnits.KM, this.parameterUnits.LKR],
            weight: [this.parameterUnits.T]
        }

        this.rail_freight_units = {
            fuel: [this.parameterUnits.L, this.parameterUnits.M3, this.parameterUnits.LKR, this.parameterUnits.KG],
            distance: [this.parameterUnits.KM, this.parameterUnits.NM, this.parameterUnits.PORT, this.parameterUnits.LKR]
        }

        this.passenger_road_units = {
            fuel: [this.parameterUnits.L, this.parameterUnits.M3, this.parameterUnits.LKR],
            distance: [this.parameterUnits.KM, this.parameterUnits.LKR],
            fuelEconomy: [this.parameterUnits.KML],
            ecDistance: [this.parameterUnits.KM],
            publicDistance: [this.parameterUnits.PKM],
            ecFuel: [this.parameterUnits.L, this.parameterUnits.M3]
        }
        this._busines_travel_units = {
            fuel: [this.parameterUnits.L, this.parameterUnits.M3, this.parameterUnits.LKR],
            distance: [this.parameterUnits.KM, this.parameterUnits.LKR],
            fuelEconomy: [this.parameterUnits.KML],
            ecDistance: [this.parameterUnits.KM],
            publicDistance: [this.parameterUnits.PKM],
            ecFuel: [this.parameterUnits.L, this.parameterUnits.M3]
        }
        this.offroad_freight_units = {
            fuel: [this.parameterUnits.L, this.parameterUnits.M3, this.parameterUnits.LKR],
            distance: [this.parameterUnits.KM, this.parameterUnits.NM, this.parameterUnits.PORT, this.parameterUnits.LKR]
        }

        /* End */

        this.passenger_offroad_units = {
            fuel: [this.parameterUnits.L, this.parameterUnits.M3, this.parameterUnits.LKR],
            distance: [this.parameterUnits.KM, this.parameterUnits.LKR],
            fuelEconomy: [this.parameterUnits.KML]
        }

        this.passenger_rail_units = {
            fuel: [this.parameterUnits.L, this.parameterUnits.M3, this.parameterUnits.LKR, this.parameterUnits.KG],
            distance: [this.parameterUnits.KM, this.parameterUnits.PKM],
            fuelEconomy: [this.parameterUnits.KML]
        }

        this.offroad_machinery_units = {
            fuel: [this.parameterUnits.L, this.parameterUnits.M3, this.parameterUnits.LKR],
            distance: [this.parameterUnits.KM, this.parameterUnits.LKR],
            fuelEconomy: [this.parameterUnits.KML]
        }

        this.months = [
            { value: 12, name: "All" },
            { value: 0, name: "January" },
            { value: 1, name: "February" },
            { value: 2, name: "March" },
            { value: 3, name: "April" },
            { value: 4, name: "May" },
            { value: 5, name: "June" },
            { value: 6, name: "July" },
            { value: 7, name: "August" },
            { value: 8, name: "September" },
            { value: 9, name: "October" },
            { value: 10, name: "November" },
            { value: 11, name: "December" },
        ],

        this.fireExtinguisherTypes = [
            { name: 'CO₂', id: 1, code: 'CO2' },
            { name: 'W/Gas', id: 2, code: 'D/C/P' }
        ]

        this.anaerobicDeepLagoons = [
            { id: 1, name: "Sea, River and lake discharge", code:  "mcf_Sea_River"},
            { id: 2, name: "Aerobic treatment plant with well managed", code: "mcf_A_T_P_Well_Managed" },
            { id: 3, name: "Aerobic treatment plant without well managed", code: "mcf_A_T_P_Not_Well_Managed" },
            { id: 4, name: "Anaerobic digester for sludge", code: "mcf_A_D_Sludge" },
            { id: 5, name: "Anaerobic Reactor", code: "mcf_Anaerobic_Reactor" },
            { id: 6, name: "Anaerobic shallow lagoon", code: "mcf_Anaerobic_Shallow_Lagoon" },
            { id: 7, name: "Anaerobic deep lagoon", code: "mcf_Anaerobic_Deep_Lagoon" }
        ]

        this.fuelType = [
            { id: 1, name: "Petrol", code: "PETROL" },
            { id: 2, name: "Diesel", code: "DIESEL" }
        ]

        this.options_passenger_air = [
            { id: 1, name: "One Way", code: "ONE_WAY" },
            { id: 2, name: "Round Trip", code: "ROUND_TRIP" }
        ]

        this.class_passenger_air = [
            { id: 1, name: "Economy", code: "ECONOMY" },
            { id: 2, name: "Premium", code: "PREMIUM" }
        ]

        this.strokes = [
            { id: 1, name: "Two Stroke", code: "TWO" },
            { id: 2, name: "Four Stroke", code: "FOUR" },
        ]

        this.cargoType_road_freightTransport = [
            { id: 1, name: "Agricultural products and live animals", code: "AGRICULTURAL_PRODUCTS_AND_LIVE_ANIMALS", },
            { id: 2, name: "Beverage", code: "BEVERAGE"},
            { id: 3, name: "Groceries", code: "GROCERIES"},
            { id: 4, name: "Perishable and semi-perishable foodstuff and canned food", code: "PERISHABLE_AND_SEMI_PERISHABLE_FOODSTUFF_AND_CANNED_FOOD"},
            { id: 5, name: "Other food products and fodder", code: "OTHER_FOOD_PRODUCTS_AND_FODDER"},
            { id: 6, name: "Solid minerul fuels and petroleum products", code: "SOLID_MINERUL_FUELS_AND_PETROLEUM_PRODUCTS"},
            { id: 7, name: "Ores and metal waste", code: "ORES_AND_METAL_WASTE"},
            { id: 8, name: "Metal products", code: "METAL_PRODUCTS"},
            { id: 9, name: "Mineral products", code: "MINERAL_PRODUCTS"},
            { id: 10, name: "Other crude and manufactured minerals and building materials", code: "OTHER_CRUDE_AND_MANUFACTURED_MINERALS_AND_BUILDING_MATERIALS"},
            { id: 11, name: "Fertilizers", code: "FERTILIZERS"},
            { id: 12, name: "Chemicals", code: "CHEMICALS"},
            { id: 13, name: "Transport equipment", code: "TRANSPORT_EQUIPMENT"},
            { id: 14, name: "Machinery and metal products", code: "MACHINERY_AND_METAL_PRODUCTS"},
            { id: 15, name: "Glass and ceramic and porcelain products", code: "GLASS_AND_CERAMIC_AND_PORCELAIN_PRODUCTS"},
            { id: 16, name: "Grouped goods", code: "GROUPED_GOODS"},
            { id: 17, name: "Other manufactured articles", code: "OTHER_MANUFACTURED_ARTICLES"},
            { id: 17, name: "Other", code: "OTHER"}, //update in freight road if removed
          ]
          this.cargoType_shared = [
            { id: 1, name: "Municipal waste", code: "MUNICIPAL_WASTE", },
            { id: 2, name: "Water bottles", code: "WATER_BOTTLES"},
            { id: 3, name: "Stationaries", code: "STATIONARIES"},
            { id: 4, name: "Machinery and metal products", code: "MACHINERY_AND_METAL_PRODUCTS"},
            { id: 5, name: "Chemicals", code: "CHEMICALS"},
            { id: 6, name: "Solid minerul fuels and petroleum products", code: "SOLID_MINERUL_FUELS_AND_PETROLEUM_PRODUCTS"},
            { id: 7, name: "Groceries", code: "GROCERIES"},
            { id: 8, name: "Organic: food and drink waste", code: "ORGANIC_FOOD_DRINK_WASTE"},
            { id: 9, name: "Organic: mixed food and garden waste", code: "ORGANIC_MIXED_FOOD_GARDEN_WASTE"},
            { id: 10, name: "Plastics", code: "PLASTICS"},
            { id: 11, name: "Paper and board", code: "PAPER_BOARD"},
            { id: 11, name: "Books", code: "BOOKS"},
          ]

        this.gWP_RGs = [
            { id: 1, name: "R22" },
            { id: 2, name: "R407C" },
            { id: 3, name: "R410A" },
            { id: 4, name: "R134a" }]

        this.disposalWasteTypes = [
            { id: 1, name: "Average construction", wasteId: 1, code: "AVERAGE_CONSTRUCTION" },
            { id: 2, name: "Tyres", wasteId: 1, code: "TYRES" },
            { id: 3, name: "Wood", wasteId: 1, code: "WOOD" },

            { id: 4, name: "Average construction", wasteId: 2, code: "AVERAGE_CONSTRUCTION" },
            { id: 5, name: "tyres", wasteId: 2, code: "TYRES" },
            { id: 6, name: "Wood", wasteId: 2, code: "WOOD" },
            { id: 7, name: "Glass", wasteId: 2, code: "GLASS" },
            { id: 8, name: "Municipal waste", wasteId: 2, code: "MUNICIPAL_WASTE" },
            { id: 9, name: "WEEE", wasteId: 2, code: "WEEE" },
            { id: 10, name: "WEEE - Fridges and freezers", wasteId: 2, code: "WEEE_FRIDGES_AND_FREEZERS" },
            { id: 11, name: "batteries", wasteId: 2, code: "BATTERIES" },
            { id: 12, name: "Plastics", wasteId: 2, code: "PLASTICS" },

            { id: 13, name: "Average construction", wasteId: 3, code: "AVERAGE_CONSTRUCTION" },
            { id: 14, name: "Soils", wasteId: 3, code: "SOILS" },
            { id: 15, name: "Tyres", wasteId: 3, code: "TYRES" },
            { id: 16, name: "Wood", wasteId: 3, code: "WOOD" },
            { id: 17, name: "Books", wasteId: 3, code: "BOOKS" },
            { id: 18, name: "Glass", wasteId: 3, code: "GLASS" },
            { id: 19, name: "Clothing", wasteId: 3, code: "CLOTHING" },
            { id: 20, name: "Municipal waste", wasteId: 3, code: "MUNICIPAL_WASTE" },
            { id: 21, name: "Commercial and industrial waste", wasteId: 3, code: "COMMERCIAL_AND_INDUSTRIAL_WASTE" },
            { id: 22, name: "Metal", wasteId: 3, code: "METAL" },
            { id: 23, name: "Plastics", wasteId: 3, code: "PLASTICS" },
            { id: 24, name: "Paper and Board", wasteId: 3, code: "PAPER_AND_BOARD" },

            { id: 25, name: "Wood", wasteId: 4, code: "WOOD" },
            { id: 26, name: "Books", wasteId: 4, code: "BOOKS" },
            { id: 27, name: "Glass", wasteId: 4, code: "GLASS" },
            { id: 28, name: "Clothing", wasteId: 4, code: "CLOTHING" },
            { id: 29, name: "Municipal waste", wasteId: 4, code: "MUNICIPAL_WASTE" },
            { id: 30, name: "Organic: Food and drink waste", wasteId: 4, code: "ORGANIC_FOOD_AND_DRINK_WASTE" },
            { id: 31, name: "Organic: Garden waste", wasteId: 4, code: "ORGANIC_GARDEN_WASTE" },
            { id: 32, name: "Organic: Mixed food and garden waste", wasteId: 4, code: "ORGANIC_MIXED_FOOD_AND_GARDEN_WASTE" },
            { id: 33, name: "Commercial and industrial waste", wasteId: 4, code: "COMMERCIAL_AND_INDUSTRIAL_WASTE" },
            { id: 34, name: "WEEE", wasteId: 4, code: "WEEE" },
            { id: 35, name: "Metal", wasteId: 4, code: "METAL" },
            { id: 36, name: "Plastics", wasteId: 4, code: "PLASTICS" },

            { id: 37, name: "Wood", wasteId: 5, code: "WOOD" },
            { id: 38, name: "Books", wasteId: 5, code: "BOOKS" },
            { id: 39, name: "Organic: Food and drink waste", wasteId: 5, code: "ORGANIC_FOOD_AND_DRINK_WASTE" },
            { id: 40, name: "Organic: Garden waste", wasteId: 5, code: "ORGANIC_GARDEN_WASTE" },
            { id: 41, name: "Organic: Mixed food and garden waste", wasteId: 5, code: "ORGANIC_MIXED_FOOD_AND_GARDEN_WASTE" },
            { id: 42, name: "Paper and Board", wasteId: 5, code: "PAPER_AND_BOARD" },

            { id: 43, name: "Soils", wasteId: 6, code: "SOILS" },
            { id: 44, name: "Books", wasteId: 6, code: "BOOKS" },
            { id: 45, name: "Glass", wasteId: 6, code: "GLASS" },
            { id: 46, name: "Clothing", wasteId: 6, code: "CLOTHING" },
            { id: 47, name: "Municipal waste", wasteId: 6, code: "MUNICIPAL_WASTE" },
            { id: 48, name: "Organic: Food and drink waste", wasteId: 6, code: "ORGANIC_FOOD_AND_DRINK_WASTE" },
            { id: 49, name: "Organic: Garden waste", wasteId: 6, code: "ORGANIC_GARDEN_WASTE" },
            { id: 50, name: "Organic: Mixed food and garden waste", wasteId: 6, code: "ORGANIC_MIXED_FOOD_AND_GARDEN_WASTE" },
            { id: 51, name: "WEEE", wasteId: 6, code: "WEEE" },
            { id: 52, name: "WEEE - Fridges and freezers", wasteId: 6, code: "WEEE_FRIDGES_AND_FREEZERS" },
            { id: 53, name: "Batteries", wasteId: 6, code: "BATTERIES" },
            { id: 54, name: "Metal", wasteId: 6, code: "METAL" },
            { id: 55, name: "Plastics", wasteId: 6, code: "PLASTICS" },
            { id: 56, name: "Paper and Board", wasteId: 6, code: "PAPER_AND_BOARD" },

            { id: 57, name: "Municipal waste", wasteId: 7, code: "MUNICIPAL_WASTE" },
            { id: 58, name: "Organic: Food and drink waste", wasteId: 7, code: "ORGANIC_FOOD_AND_DRINK_WASTE" },
            { id: 59, name: "Organic: Garden waste", wasteId: 7, code: "ORGANIC_GARDEN_WASTE" },
            { id: 60, name: "Organic: Mixed food and garden waste", wasteId: 7, code: "ORGANIC_MIXED_FOOD_AND_GARDEN_WASTE" },
            { id: 61, name: "Commercial and industrial waste", wasteId: 7, code: "COMMERCIAL_AND_INDUSTRIAL_WASTE" },

            { id: 62, name: "Waste", wasteId: 8, code: "WASTE" },

            { id: 63, name: "Paper/Cardboard", wasteId: 9, code: "PAPER_CARDBOARD" },
            { id: 64, name: "Textile", wasteId: 9, code: "TEXTILE" },
            { id: 65, name: "Food waste", wasteId: 9, code: "FOOD_WASTE" },
            { id: 66, name: "Wood", wasteId: 9, code: "WOOD" },
            { id: 67, name: "Garden and park waste", wasteId: 9, code: "GARDEN_AND_PARK_WASTE" },
            { id: 68, name: "Nappies", wasteId: 9, code: "NAPPIES" },
            { id: 69, name: "Rubber and leather", wasteId: 9, code: "RUBBER_AND_LEATHER" },
            { id: 70, name: "Plastics", wasteId: 9, code: "PLASTICS" },
            { id: 71, name: "Other wastes", wasteId: 9, code: "OTHER_WASTES" },
            { id: 72, name: "Domestic", wasteId: 9, code: "DOMESTIC" },
            { id: 73, name: "Industrial", wasteId: 9, code: "INDUSTRIAL" },

            { id: 74, name: "Aggregates", wasteId: 2, code: "AGGREGATES" },
            { id: 75, name: "Asphalt", wasteId: 2, code: "ASPHALT" },
            { id: 76, name: "Bricks", wasteId: 2, code: "BRICKS" },
            { id: 77, name: "Concrete", wasteId: 2, code: "CONCRETE" },
            { id: 78, name: "WEEE - large", wasteId: 2, code: "WEEE_LARGE" },
            { id: 79, name: "WEEE - mixed", wasteId: 2, code: "WEEE_MIXED" },
            { id: 80, name: "WEEE - small", wasteId: 2, code: "WEEE_SMALL" },
            { id: 81, name: "Metal: aluminium cans and foil (excl. forming)", wasteId: 2, code: "METAL_ALUMINIUMCANS_FOIL" },
            { id: 82, name: "Metal: mixed cans", wasteId: 2, code: "METAL_MIXED_CANS" },
            { id: 83, name: "Metal: scrap metal", wasteId: 2, code: "METAL_SCRAP_METAL" },
            { id: 84, name: "Metal: steel cans", wasteId: 2, code: "METAL_STEEL_CANS" },
            { id: 85, name: "Plastics: average plastics", wasteId: 2, code: "PLASTICS_AVERAGE_PLASTICS" },
            { id: 86, name: "Plastics: average plastic film", wasteId: 2, code: "PLASTICS_AVERAGE_PLASTIC_FILM" },
            { id: 87, name: "Plastics: average plastic rigid", wasteId: 2, code: "PLASTICS_AVERAGE_PLASTIC_RIGID" },
            { id: 88, name: "Plastics: HDPE (incl. forming)", wasteId: 2, code: "PLASTICS_HDPE" },
            { id: 89, name: "Plastics: LDPE and LLDPE (incl. forming)", wasteId: 2, code: "PLASTICS_LDPE_LLDPE" },
            { id: 90, name: "Plastics: PET (incl. forming)", wasteId: 2, code: "PLASTICS_PET" },
            { id: 91, name: "Plastics: PP (incl. forming)", wasteId: 2, code: "PLASTICS_PP" },
            { id: 92, name: "Plastics: PS (incl. forming)", wasteId: 2, code: "PLASTICS_PS" },
            { id: 93, name: "Plastics: PVC (incl. forming)", wasteId: 2, code: "PLASTICS_PVC" },
            { id: 94, name: "Aggregates", wasteId: 3, code: "AGGREGATES" },
            { id: 95, name: "Insulation", wasteId: 3, code: "INSULATION" },
            { id: 96, name: "Mineral oil", wasteId: 3, code: "MINERAL_OIL" },
            { id: 97, name: "Plasterboard", wasteId: 3, code: "PLASTERBOARD" },
            { id: 98, name: "Asphalt", wasteId: 3, code: "ASPHALT" },
            { id: 99, name: "Concrete", wasteId: 3, code: "CONCRETE" },
            { id: 100, name: "Metal: aluminium cans and foil (excl. forming)", wasteId: 3, code: "METAL_ALUMINIUMCANS_FOIL" },
            { id: 101, name: "Metal: mixed cans", wasteId: 3, code: "METAL_MIXED_CANS" },
            { id: 102, name: "Metal: scrap metal", wasteId: 3, code: "METAL_SCRAP_METAL" },
            { id: 103, name: "Metal: steel cans", wasteId: 3, code: "METAL_STEEL_CANS" },
            { id: 104, name: "Plastics: average plastics", wasteId: 3, code: "PLASTICS_AVERAGE_PLASTICS" },
            { id: 105, name: "Plastics: average plastic film", wasteId: 3, code: "PLASTICS_AVERAGE_PLASTIC_FILM" },
            { id: 106, name: "Plastics: average plastic rigid", wasteId: 3, code: "PLASTICS_AVERAGE_PLASTIC_RIGID" },
            { id: 107, name: "Plastics: HDPE (incl. forming)", wasteId: 3, code: "PLASTICS_HDPE" },
            { id: 108, name: "Plastics: LDPE and LLDPE (incl. forming)", wasteId: 3, code: "PLASTICS_LDPE_LLDPE" },
            { id: 109, name: "Plastics: PET (incl. forming)", wasteId: 3, code: "PLASTICS_PET" },
            { id: 110, name: "Plastics: PP (incl. forming)", wasteId: 3, code: "PLASTICS_PP" },
            { id: 111, name: "Plastics: PS (incl. forming)", wasteId: 3, code: "PLASTICS_PS" },
            { id: 112, name: "Plastics: PVC (incl. forming)", wasteId: 3, code: "PLASTICS_PVC" },
            { id: 113, name: "Paper and board: board", wasteId: 3, code: "PAPER_BOARD_BOARD" },
            { id: 114, name: "Paper and board: mixed", wasteId: 3, code: "PAPER_BOARD_MIXED" },
            { id: 115, name: "Paper and board: paper", wasteId: 3, code: "PAPER_BOARD_PAPER" },

            { id: 116, name: "Average construction", wasteId: 4, code: "AVERAGE_CONSTRUCTION" },
            { id: 117, name: "Mineral oil", wasteId: 4, code: "MINERAL_OIL" },
            { id: 118, name: "Household residual waste", wasteId: 4, code: "HOUSEHOLD_RESIDUAL_WASTE" },
            { id: 119, name: "WEEE - large", wasteId: 4, code: "WEEE_LARGE" },
            { id: 120, name: "WEEE - mixed", wasteId: 4, code: "WEEE_MIXED" },
            { id: 121, name: "WEEE - small", wasteId: 4, code: "WEEE_SMALL" },
            { id: 122, name: "Metal: aluminium cans and foil (excl. forming)", wasteId: 4, code: "METAL_ALUMINIUMCANS_FOIL" },
            { id: 123, name: "Metal: mixed cans", wasteId: 4, code: "METAL_MIXED_CANS" },
            { id: 124, name: "Metal: scrap metal", wasteId: 4, code: "METAL_SCRAP_METAL" },
            { id: 125, name: "Metal: steel cans", wasteId: 4, code: "METAL_STEEL_CANS" },
            { id: 126, name: "Plastics: average plastics", wasteId: 4, code: "PLASTICS_AVERAGE_PLASTICS" },
            { id: 127, name: "Plastics: average plastic film", wasteId: 4, code: "PLASTICS_AVERAGE_PLASTIC_FILM" },
            { id: 128, name: "Plastics: average plastic rigid", wasteId: 4, code: "PLASTICS_AVERAGE_PLASTIC_RIGID" },
            { id: 129, name: "Plastics: HDPE (incl. forming)", wasteId: 4, code: "PLASTICS_HDPE" },
            { id: 130, name: "Plastics: LDPE and LLDPE (incl. forming)", wasteId: 4, code: "PLASTICS_LDPE_LLDPE" },
            { id: 131, name: "Plastics: PET (incl. forming)", wasteId: 4, code: "PLASTICS_PET" },
            { id: 132, name: "Plastics: PP (incl. forming)", wasteId: 4, code: "PLASTICS_PP" },
            { id: 133, name: "Plastics: PS (incl. forming)", wasteId: 4, code: "PLASTICS_PS" },
            { id: 134, name: "Plastics: PVC (incl. forming)", wasteId: 4, code: "PLASTICS_PVC" },
            { id: 135, name: "Paper and board: board", wasteId: 4, code: "PAPER_BOARD_BOARD" },
            { id: 136, name: "Paper and board: mixed", wasteId: 4, code: "PAPER_BOARD_MIXED" },
            { id: 137, name: "Paper and board: paper", wasteId: 4, code: "PAPER_BOARD_PAPER" },

            { id: 138, name: "Paper and board: board", wasteId: 5, code: "PAPER_BOARD_BOARD" },
            { id: 139, name: "Paper and board: mixed", wasteId: 5, code: "PAPER_BOARD_MIXED" },
            { id: 140, name: "Paper and board: paper", wasteId: 5, code: "PAPER_BOARD_PAPER" },

            { id: 141, name: "Aggregates", wasteId: 6, code: "AGGREGATES" },
            { id: 142, name: "Asbestos", wasteId: 6, code: "ASPHALT" },
            { id: 143, name: "Asphalt", wasteId: 6, code: "ASPHALT" },
            { id: 144, name: "Bricks", wasteId: 6, code: "BRICKS" },
            { id: 145, name: "Concrete", wasteId: 6, code: "CONCRETE" },
            { id: 146, name: "Insulation", wasteId: 6, code: "INSULATION" },
            { id: 147, name: "Plasterboard", wasteId: 6, code: "PLASTERBOARD" },
            { id: 148, name: "Household residual waste", wasteId: 6, code: "HOUSEHOLD_RESIDUAL_WASTE" },
            { id: 149, name: "WEEE - large", wasteId: 6, code: "WEEE_LARGE" },
            { id: 150, name: "WEEE - mixed", wasteId: 6, code: "WEEE_MIXED" },
            { id: 151, name: "WEEE - small", wasteId: 6, code: "WEEE_SMALL" },
            { id: 152, name: "Metal: aluminium cans and foil (excl. forming)", wasteId: 6, code: "METAL_ALUMINIUMCANS_FOIL" },
            { id: 153, name: "Metal: mixed cans", wasteId: 6, code: "METAL_MIXED_CANS" },
            { id: 154, name: "Metal: scrap metal", wasteId: 6, code: "METAL_SCRAP_METAL" },
            { id: 155, name: "Metal: steel cans", wasteId: 6, code: "METAL_STEEL_CANS" },
            { id: 156, name: "Plastics: average plastics", wasteId: 6, code: "PLASTICS_AVERAGE_PLASTICS" },
            { id: 157, name: "Plastics: average plastic film", wasteId: 6, code: "PLASTICS_AVERAGE_PLASTIC_FILM" },
            { id: 158, name: "Plastics: average plastic rigid", wasteId: 6, code: "PLASTICS_AVERAGE_PLASTIC_RIGID" },
            { id: 159, name: "Plastics: HDPE (incl. forming)", wasteId: 6, code: "PLASTICS_HDPE" },
            { id: 160, name: "Plastics: LDPE and LLDPE (incl. forming)", wasteId: 6, code: "PLASTICS_LDPE_LLDPE" },
            { id: 161, name: "Plastics: PET (incl. forming)", wasteId: 6, code: "PLASTICS_PET" },
            { id: 162, name: "Plastics: PP (incl. forming)", wasteId: 6, code: "PLASTICS_PP" },
            { id: 163, name: "Plastics: PS (incl. forming)", wasteId: 6, code: "PLASTICS_PS" },
            { id: 164, name: "Plastics: PVC (incl. forming)", wasteId: 6, code: "PLASTICS_PVC" },
            { id: 165, name: "Paper and board: board", wasteId: 6, code: "PAPER_BOARD_BOARD" },
            { id: 166, name: "Paper and board: mixed", wasteId: 6, code: "PAPER_BOARD_MIXED" },
            { id: 167, name: "Paper and board: paper", wasteId: 6, code: "PAPER_BOARD_PAPER" },
        ]

        this.cookingGasTypes = [
            { id: 1, name: "Landfill Gas", sourceId: 1, code: "LANDFILLGAS" },
            { id: 2, name: "Sludge Gas", sourceId: 1, code: "SLUDGEGAS" },
            { id: 3, name: "Other Biogas", sourceId: 1, code: "OTHERBIOGAS" },
            { id: 4, name: "LP Gas", sourceId: 2, code: "LP_GAS" }
        ]

    }

    set electricity_units(value) {
        this._electricity_units = value;
    }

    get electricity_units() {
        return this._electricity_units;
    }

    set boiler_units(value) {
        this._boilers_units = value;
    }

    get boiler_units() {
        return this._boilers_units;
    }

    set fire_extinguisher_units(value: any) {
        this._fire_extinguisher_units = value;
    }

    get fire_extinguisher_units() {
        return this._fire_extinguisher_units;
    }

    set generator_units(value: any) {
        this._generator_units = value;
    }

    get generator_units() {
        return this._generator_units;
    }

    set refrigerant_units(value: any) {
        this._refrigerant_units = value;
    }

    get refrigerant_units() {
        return this._refrigerant_units;
    }

    set welding_units(value: any) {
        this._welding_units = value;
    }

    get welding_units() {
        return this._welding_units;
    }

    set forklifts_units(value) {
        this._forklifts_units = value;
    }

    get forklifts_units() {
        return this._forklifts_units;
    }

    set waste_water_units(value) {
        this._waste_water_units = value;
    }

    get waste_water_units() {
        return this._waste_water_units;
    }

    set municipal_water_units(value) {
        this._municipal_water_units = value;
    }

    get municipal_water_units() {
        return this._municipal_water_units;
    }

    set waste_disposal_units(value) {
        this._waste_disposal_units = value;
    }

    get waste_disposal_units() {
        return this._waste_disposal_units;
    }

    set cooking_gas_units(value) {
        this._cooking_gas_units = value;
    }

    get cooking_gas_units() {
        return this._cooking_gas_units;
    }
    set road_freight_units(value) {
        this._road_freight_units = value;
    }

    get road_freight_units() {
        return this._road_freight_units;
    }

    set air_freight_units(value) {
        this._air_freight_units = value;
    }

    get air_freight_units() {
        return this._air_freight_units;
    }

    set water_freight_units(value) {
        this._water_freight_units = value;
    }

    get water_freight_units() {
        return this._water_freight_units;
    }

    set rail_freight_units(value) {
        this._rail_freight_units = value;
    }

    get rail_freight_units() {
        return this._rail_freight_units;
    }

    set passenger_road_units(value) {
        this._passenger_road_units = value;
    }

    get passenger_road_units() {
        return this._passenger_road_units;
    }

    set busines_travel_units(value) {
        this._busines_travel_units = value;
    }

    get busines_travel_units() {
        return this._busines_travel_units;
    }

    set passenger_offroad_units(value) {
        this._passenger_offroad_units = value;
    }

    get passenger_offroad_units() {
        return this._passenger_offroad_units;
    }

    set passenger_rail_units(value) {
        this._passenger_rail_units = value
    }
    set offroad_freight_units(value) {
        this._offroad_freight_units = value;
    }

    get offroad_freight_units() {
        return this._offroad_freight_units;
    }

    get passenger_rail_units() {
        return this._passenger_rail_units;
    }

    set offroad_machinery_units(value) {
        this._offroad_machinery_units = value;
    }

    get offroad_machinery_units() {
        return this._offroad_machinery_units;
    }

    set fireExtinguisherTypes(value: { name: string; id: number; code: string }[]) {
        this._fireExtinguisherTypes = value;
    }

    get fireExtinguisherTypes(): { name: string; id: number; code: string }[] {
        return this._fireExtinguisherTypes;
    }

    set anaerobicDeepLagoons(value: { name: string; id: number; code: string }[]) {
        this._anaerobicDeepLagoons = value;
    }

    get anaerobicDeepLagoons(): { name: string; id: number; code: string }[] {
        return this._anaerobicDeepLagoons;
    }

    set fuelType(value: { name: string; id: number, code: string }[]) {
        this._fuelType = value;
    }

    get fuelType(): { name: string; id: number, code: string }[] {
        return this._fuelType;
    }

    set options_passenger_air(value: { name: string; id: number, code: string }[]) {
        this._options_passenger_air = value;
    }

    get options_passenger_air(): { name: string; id: number, code: string }[] {
        return this._options_passenger_air;
    }

    set class_passenger_air(value: { name: string; id: number, code: string }[]) {
        this._class_passenger_air = value;
    }

    get class_passenger_air(): { name: string; id: number, code: string }[] {
        return this._class_passenger_air;
    }

    set strokes(value: { name: string; id: number; code: string }[]) {
        this._strokes = value;
    }

    get strokes(): { name: string; id: number; code: string }[] {
        return this._strokes;
    }

    set cargoType_road_freightTransport(value: { name: string; id: number; code: string }[]) {
        this._cargoType_road_freightTransport = value;
    }

    get cargoType_road_freightTransport(): { name: string; id: number; code: string }[] {
        return this._cargoType_road_freightTransport;
    }

    set cargoType_shared(value: { name: string; id: number; code: string }[]) {
        this._cargoType_shared = value;
    }

    get cargoType_shared(): { name: string; id: number; code: string }[] {
        return this._cargoType_shared;
    }

    set months(value: { name: string; value: number }[]) {
        this._months = value;
    }

    get months(): { name: string; value: number }[] {
        return this._months;
    }

    set gWP_RGs(value: { name: string; id: number }[]) {
        this._gWP_RGs = value;
    }

    get gWP_RGs(): { name: string; id: number }[] {
        return this._gWP_RGs;
    }

    set disposalWasteTypes(value: { name: string; id: number; wasteId: number; code: string; }[]) {
        this._disposalWasteTypes = value;
    }

    get disposalWasteTypes(): { name: string; id: number; wasteId: number; code: string; }[] {
        return this._disposalWasteTypes;
    }

    set cookingGasTypes(value: { name: string; id: number; sourceId: number; code: string; }[]) {
        this._cookingGasTypes = value;
    }

    get cookingGasTypes(): { name: string; id: number; sourceId: number; code: string; }[] {
        return this._cookingGasTypes;
    }


}

