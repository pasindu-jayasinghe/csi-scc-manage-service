export enum PurchasedGoodsAndServicesMethod{
    supplier_specific_method = 'Supplier Specific Method',
    hybrid_method = 'Hybrid Method',
    average_data_method = 'Average Data Method',
    spend_based_method = 'Spend Based Method'
}

export enum TypeNames{
    purchase = 'Purchased Goods and Services',
    material = 'Material Inputs',
    transport = 'Transport of Material Inputs',
    waste = 'Waste Outputs',
    other = 'Other waste emissions'
}

export enum WasteActivities {
    BIOLOGICAL_TREATMENT = "BIOLOGICAL_TREATMENT",
    WASTE_INCINERATION = "WASTE_INCINERATION",
    OPEN_BURNING = "OPEN_BURNING",
    DOMESTIC_WASTEWATER = "DOMESTIC_WASTEWATER",
    INDUSTRIAL_WASTEWATER = "INDUSTRIAL_WASTEWATER",
    OTHER = "OTHER_ACTIVITIES_BASED_ON_DEFRA",
    INCINERATION = "INCINERATION"
}