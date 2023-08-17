import { sourceName } from "src/emission/enum/sourcename.enum"

export const controlApproachDescription = "Under the control approach, each entity accounts for 100% of the GHG emissions from operations over which it has control. It does not account for GHG emissions from operations where it has an interest but has no control. Control can be defined either financial or operational terms. When using the control approach to consolidate GHG emissions, companies shall choose between either the operational control or financial control criteria."
export const equityShareDescription = "Under the equity share approach, a company accounts for GHG emissions from operations according to its share of equity in the operation. The equity share reflects economic interest, which is the extent of rights a company has to the risks and rewards flowing from an operation. Typically, the share of economic risks and rewards in an operation is aligned with the company’s percentage ownership of that operation, and equity share will normally be the same as the ownership percentage. Where this is not the case, the economic substance of the relationship the company has with the operation always overrides the legal ownership form to ensure that equity share reflects the percentage of economic interest. The principle of economic substance taking precedent over legal form is consistent with international financial reporting standards. The staff preparing the inventory may therefore need to consult with the company’s accounting or legal staff to ensure that the appropriate equity share percentage is applied for each joint operation (see Table 1 for definitions of financial accounting categories). "

// source (http://pdf.wri.org/ghg_protocol_2004_chp003.pdf)

export const control_approach = { name: 'Control Approach', code: 'CONTROL_APPROACH' }
export const equity_share = { name: 'Control Approach', code: 'CONTROL_APPROACH' }

export const glossaryOfTerms = [
    {title: 'Electricity', code: sourceName.Electricity, description: 'GHG emission source attributed to electricity'},
    {title: 'Generator', code: sourceName.Generator, description: 'GHG emission source attribute to use of Generators'},
    {title: 'Boilers', code: sourceName.Boilers, description: 'GHG emission source attributed to boilers'},
    {title: 'Fire Extinguisher', code: sourceName.FireExtinguisher, description: 'GHG emission source attributed to fire extinguisher'},
    {title: 'Forklifts', code: sourceName.Forklifts, description: 'GHG emission source attributed to forklifts'},
    {title: 'Municipal Water', code: sourceName.Municipal_water, description: 'GHG emission source attributed to municipal water'},
    {title: 'Refrigerant', code: sourceName.Refrigerant, description: 'GHG emission source attributed to refrigerant'},
    {title: 'Waste Water Treatment', code: sourceName.Waste_water_treatment, description: 'GHG emission source attributed to waste water treatment'},
    {title: 'Welding', code: sourceName.WeldingEs, description: 'GHG emission source attributed to welding'},
    {title: 'Cooking Gas', code: sourceName.cooking_gas, description: 'GHG emission source attributed to cooking gas'},
    {title: 'Freight Air', code: sourceName.freight_air, description: 'GHG emission source attribute to transporting freight by air'},
    {title: 'Freight Offroad', code: sourceName.freight_offroad, description: 'GHG emission source attribute to transporting freight by offroad vehicles'},
    {title: 'Freight Rail', code: sourceName.freight_rail, description: 'GHG emission source attribute to transporting freight by rail'},
    {title: 'Freight Road', code: sourceName.freight_road, description: 'GHG emission source attributed to freight road'},
    {title: 'Freight Water', code: sourceName.freight_water, description: 'GHG emission source attribute to transporting freight by water'},
    {title: 'Offroad Machinery', code: sourceName.offroad_machinery, description: 'GHG emission source attributed to offroad machinery'},
    {title: 'Passenger Air', code: sourceName.passenger_air, description: 'GHG emission source attribute to passenger transport by air'},
    {title: 'Passenger Offroad', code: sourceName.passenger_offroad, description: 'GHG emission source attribute to passenger transport by offroad vehicles'},
    {title: 'Passenger Rail', code: sourceName.passenger_rail, description: 'GHG emission source attribute to passenger transport by rail'},
    {title: 'Employee Commuting', code: sourceName.passenger_road, description: 'GHG emission source attribute to employee commuting by road vehicles'},
    {title: 'Waste Disposal', code: sourceName.waste_disposal, description: 'GHG emission source attributed to waste disposal'},
    {title: 'Business Travel', code: sourceName.business_travel, description: 'GHG emission source attributed to buisness travel by road vehicles'},
    {title: 'T&D Loss', code: sourceName.t_n_d_loss, description: 'GHG emission source attributed to t&d loss'}

]