import { Injectable } from '@nestjs/common';
import { sourceName } from 'src/emission/enum/sourcename.enum';

@Injectable()
export class EquationLibService {
    private _equations: any;

    // public equations = {
    //     [sourceName.Electricity]: {
    //         "operators": [
    //             {
    //                 "operator": "*",
    //                 "factor": 9,
    //                 "order": 1
    //             },
    //             {
    //                 "operator": "/",
    //                 "factor": 5,
    //                 "order": 2
    //             },
    //             {
    //                 "operator": "+",
    //                 "factor": 32,
    //                 "order": 3
    //             }
    //         ]
    //     }
    // }

    constructor() {
        
        this.equations = {
            [sourceName.Generator]: {
                equations: [
                    {
                        equation: 'TE<sub>DG</sub> = (F<sub>CD</sub> /1000) x D<sub>D</sub> x NCV<sub>D</sub>',
                        header: '',
                        parameters: [
                            'TE<sub>DG</sub> = Total energy consumed by the diesel generator (TJ)',
                            'F<sub>CD</sub> = Fuel consumed by the diesel generator per year (L)',
                            'D<sub>D</sub> = Density of the fuel (t/m<sup>3</sup>)',
                            'NCV<sub>D</sub> = Net calorific value of the fuel (TJ/t)'
                        ]
                    },
                    {
                        equation: 'E<sub>DG</sub> = (((EF<sub>CO<sub>2</sub></sub><sub>, S, Diesel</sub> x GWP<sub>CO<sub>2</sub></sub> )/1000) x TE<sub>DG</sub>) + (((EF<sub>CH<sub>4</sub></sub><sub>, S, Diesel</sub> x GWP<sub>CH<sub>4</sub></sub>)/1000) x TE<sub>DG</sub>) + (((EF<sub>N<sub>2</sub>O</sub><sub>, S, Diesel</sub> x GWP<sub>N<sub>2</sub>O</sub> )/1000) x TE<sub>DG</sub>)',
                        header: '',
                        parameters: [
                            'E<sub>DG</sub> = Total GHG emissions from the diesel generator (tCO<sub>2e</sub>/year)',
                            'EF<sub>CO<sub>2</sub></sub><sub>, S, Diesel</sub> = Emission factor for CO<sub>2</sub> from stationary combustion of fuel Diesel (kg CO<sub>2</sub>/ TJ)',
                            'EF<sub>CH<sub>4</sub></sub><sub>, S, Diesel</sub> = Emission factor for CH<sub>4</sub> from stationary combustion of fuel Diesel (kg CH<sub>4</sub>/ TJ)',
                            'EF<sub>N<sub>2</sub>O</sub><sub>, S, Diesel</sub> = Emission factor for N<sub>2</sub>O from stationary combustion of fuel Diesel (kg N<sub>2</sub>O/ TJ)',
                            'GWP<sub>CO<sub>2</sub></sub> = Global warming potential for CO<sub>2</sub>',
                            'GWP<sub>CH<sub>4</sub></sub> = Global warming potential for CH<sub>4</sub>',
                            'GWP<sub>N<sub>2</sub>O</sub> = Global warming potential for N<sub>2</sub>O'
                        ]
                    }
                ]
            },
            [sourceName.Electricity]: {
                equations: [
                    {
                        equation: 'E<sub>GE</sub> = EC x EF<sub>GE</sub>',
                        header: '',
                        parameters: [
                            'E<sub>GE</sub> = Total GHG emissions from grid electricity consumption (tCO<sub>2</sub>e/year)',
                            'EC = Total electricity consumption per year(MWh)',
                            'EF<sub>GE</sub> = Emission factor for grid electricity (tCO<sub>2e</sub>/ MWh)'
                        ]
                    }
                ]
            },
            [sourceName.FireExtinguisher]: {
                equations: [
                    {
                        equation: 'E<sub>FE</sub> = W<sub>FER</sub> X N<sub>FE</sub>',
                        header2: '',
                        parameters: [
                            'E<sub>FE</sub> = Total GHG emissions from the mobile combustion(tCO<sub>2</sub>e/year)',
                            'W<sub>FER</sub> = Weight of fire extinguisher refilling per tank (tonne)',
                            'N<sub>FE</sub> = Total number of fire extinguishers refilled per year'
                        ]
                    }
                ]
            },
            [sourceName.waste_disposal]: {
                equations: [
                    {
                        equation: 'E<sub>WD<sub>X,Z</sub></sub> = (Q<sub>W,Z</sub> x EF<sub>W<sub>X,Z</sub></sub>)/1000',
                        header2: '',
                        parameters: [
                            'E<sub>WD<sub>X,Z</sub></sub>  =Total GHG emissions from waste disposal method x for waste category n (tCO<sub>2</sub>e/year)',
                            'Q<sub>W,Z</sub> = Total quantity of waste from waste category z per year (tonnes)',
                            'EF<sub>W<sub>X,Z</sub></sub> = Emission factor for waste disposal method x for waste category z (kgCO<sub>2</sub>e/ tonne'
                        ]
                    }
                ]
            },
            [sourceName.Refrigerant]: {
                equations: [
                    {
                        equation: 'E = W<sub>RG, R22</sub> x GWP<sub>RG, R22</sub>',
                        header2: '',
                        parameters: [
                            'E = Total GHG emission (tCO<sub>2</sub>e/year)',
                            'W<sub>RG</sub> = Weight of replaced amount of the refrigerant gas',
                            'GWP<sub>RG, R22</sub> = Global warming potential of the refrigerant gas'
                        ]
                    }
                ]
            },
            [sourceName.Municipal_water]: {
                equations: [
                    {
                        equation: 'E<sub>MW</sub> = ((WC x CF<sub>MW</sub>) / 1000) x EF<sub>GE</sub>',
                        header2: '',
                        parameters: [
                            'E<sub>MW</sub> = Total GHG emissions from water consumption (tCO<sub>2</sub>e/year)',
                            'WC = Total water consumption per year (m<sup>3</sup>)',
                            'CF<sub>MW</sub> = Conversion factor for municipal water (kWh/ m<sup>3</sup>)',
                            'EF<sub>GE</sub> = Emission factor for grid electricity (tCO<sub>2</sub>e/ MWh)'
                        ]
                    }
                ]
            },
            [sourceName.passenger_road]: {
                equations: [
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub> /1000) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: 'Business Travel - Fuel Based Calculation',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in liters)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ',
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub>) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: '',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in m3)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ',
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>FC<sub>n</sub> = TC<sub>n</sub> x Fuel cost per liter<sub>n</sub>',
                        header1: '',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in Currency)',
                        parameters: [
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'TC<sub>n</sub> = Total cost of fuel type n per year  (LKR or Relevant currency)',
                            'Fuel cost per liter n = Fuel cost per liter of fuel type n per year (LKR/liter or Relevant currency/liter) '
                        ]
                    },
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub> /1000) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: '',
                        header2: '',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ', 
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L) ', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>E<sub>MC</sub> = (((EF<sub>CO<sub>2</sub>, MC, n</sub> X GWP<sub>CO<sub>2</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>CH<sub>4</sub>, MC, n</sub> X GWP<sub>CH<sub>4</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>N<sub>2</sub>O, MC, n</sub> X GWP<sub>N<sub>2</sub>O</sub>)/1000) X TE<sub>MC</sub>) ',
                        header1: '',
                        header2: 'Emission calculation using energy consumption ',
                        parameters: [
                            'E<sub>MC</sub> = Total GHG emissions from the mobile combustion (tCO<sub>2</sub>e/year)  ', 
                            'TE<sub>MC</sub>= Total energy consumed by the mobile combustion (TJ)  ', 
                            'EF<sub>CO<sub>2</sub> = Emission factor for CO<sub>2</sub> from mobile combustion of fuel n (kg CO<sub>2</sub>/ TJ) ',
                            'EF<sub>CH<sub>4</sub>, MC, n</sub> = Emission factor for CH<sub>4</sub> from mobile combustion of fuel n (kg CH<sub>4</sub>/ TJ) ',
                            'EF<sub>N<sub>2</sub>O, MC, n</sub> = Emission factor for N<sub>2</sub>O from mobile combustion of fuel n (kg N<sub>2</sub>O / TJ) ',
                            'GWP<sub>CO<sub>2</sub></sub> = Global warming potential for CO<sub>2</sub> ',
                            'GWP<sub>CH<sub>4</sub></sub> = Global warming potential for CH<sub>4</sub> ',
                            'GWP<sub>N<sub>2</sub>O</sub> = Global warming potential for N<sub>2</sub>O '
                        ]
                    },
                    {
                        equation: '<br>TE<sub>MC</sub> = (((d<sub>i</sub>/FE<sub>i</sub>)*No of trips) /1000) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: 'Business Travel - Distance Based Calculation',
                        header2: 'Energy consumption calculation (If, distance and fuel economy are  given)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ', 
                            'd<sub>i</sub> = distance traveled by vehicle i per trip (km)  ', 
                            'FE<sub>i</sub> = Fuel economy of vehicle I (km/l)',
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>Distance per trip(km) = Cost per trip (LKR or currency) / rate per km (LKR/km or currency/km) ',
                        header1: '',
                        header2: 'Energy consumption calculation (If, cost is given)',
                        parameters: []
                    },
                    {
                        equation: '<br>TE<sub>MC</sub> = (((d<sub>i</sub>/FE<sub>i</sub>)*No of trips) /1000) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: '',
                        header2: '',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ', 
                            'd<sub>i</sub> = distance traveled by vehicle i per trip (km)  ', 
                            'FE<sub>i</sub> = Fuel economy of vehicle I (km/l)',
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>E<sub>MC</sub> = (((EF<sub>CO<sub>2</sub>, MC, n</sub> X GWP<sub>CO<sub>2</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>CH<sub>4</sub>, MC, n</sub> X GWP<sub>CH<sub>4</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>N<sub>2</sub>O, MC, n</sub> X GWP<sub>N<sub>2</sub>O</sub>)/1000) X TE<sub>MC</sub>) ',
                        header1: '',
                        header2: 'Emission calculation using energy consumption ',
                        parameters: [
                            'E<sub>MC</sub> = Total GHG emissions from the mobile combustion (tCO<sub>2</sub>e/year)  ', 
                            'TE<sub>MC</sub>= Total energy consumed by the mobile combustion (TJ)  ', 
                            'EF<sub>CO<sub>2</sub> = Emission factor for CO<sub>2</sub> from mobile combustion of fuel n (kg CO<sub>2</sub>/ TJ) ',
                            'EF<sub>CH<sub>4</sub>, MC, n</sub> = Emission factor for CH<sub>4</sub> from mobile combustion of fuel n (kg CH<sub>4</sub>/ TJ) ',
                            'EF<sub>N<sub>2</sub>O, MC, n</sub> = Emission factor for N<sub>2</sub>O from mobile combustion of fuel n (kg N<sub>2</sub>O / TJ) ',
                            'GWP<sub>CO<sub>2</sub></sub> = Global warming potential for CO<sub>2</sub> ',
                            'GWP<sub>CH<sub>4</sub></sub> = Global warming potential for CH<sub>4</sub> ',
                            'GWP<sub>N<sub>2</sub>O</sub> = Global warming potential for N<sub>2</sub>O '
                        ]
                    },
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub> /1000) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: 'Employee Commuting - Fuel Based Calculation',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in liters)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ',
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>TE<sub>MC</sub> = (((d<sub>i</sub>/FE<sub>i</sub>)*Working days per year) /1000) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: '',
                        header2: 'Energy consumption calculation (For private transport)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ', 
                            'd<sub>i</sub> = distance traveled in a day - one way(km)  ', 
                            'FE<sub>i</sub> = Fuel economy of vehicle I (km/l)',
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>E<sub>MC</sub> = (((EF<sub>CO<sub>2</sub>, MC, n</sub> X GWP<sub>CO<sub>2</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>CH<sub>4</sub>, MC, n</sub> X GWP<sub>CH<sub>4</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>N<sub>2</sub>O, MC, n</sub> X GWP<sub>N<sub>2</sub>O</sub>)/1000) X TE<sub>MC</sub>) ',
                        header1: '',
                        header2: 'Emission calculation using energy consumption ',
                        parameters: [
                            'E<sub>MC</sub> = Total GHG emissions from the mobile combustion (tCO<sub>2</sub>e/year)  ', 
                            'TE<sub>MC</sub>= Total energy consumed by the mobile combustion (TJ)  ', 
                            'EF<sub>CO<sub>2</sub> = Emission factor for CO<sub>2</sub> from mobile combustion of fuel n (kg CO<sub>2</sub>/ TJ) ',
                            'EF<sub>CH<sub>4</sub>, MC, n</sub> = Emission factor for CH<sub>4</sub> from mobile combustion of fuel n (kg CH<sub>4</sub>/ TJ) ',
                            'EF<sub>N<sub>2</sub>O, MC, n</sub> = Emission factor for N<sub>2</sub>O from mobile combustion of fuel n (kg N<sub>2</sub>O / TJ) ',
                            'GWP<sub>CO<sub>2</sub></sub> = Global warming potential for CO<sub>2</sub> ',
                            'GWP<sub>CH<sub>4</sub></sub> = Global warming potential for CH<sub>4</sub> ',
                            'GWP<sub>N<sub>2</sub>O</sub> = Global warming potential for N<sub>2</sub>O '
                        ]
                    },
                    {
                        equation: '<br>E<sub>MC</sub> = ((Passenger km *working days) * EF<sub>per passenger km</sub>)/1000',
                        header1: '',
                        header2: 'Energy consumption calculation (For public transport)',
                        parameters: [
                            'E<sub>MC</sub> = Total emissions by the mobile combustion(TJ) ', 
                            'Passenger km = distance traveled by a passenger per trip - one way (passenger km)   ', 
                            'EF<sub>per passenger km</sub>= Emission factor per passenger km (kgCO<sub>2</sub>e /passenger km)'
                        ]
                    },
                ]
            },
            [sourceName.Boilers]: {
                equations: [
                    {
                        equation: 'TE<sub>SC</sub> = (FC<sub>n</sub> /1000)  x D<sub>n</sub> x NCV<sub>n</sub> ',
                        header1: '',
                        header2: 'Energy consumption calculation (furnace oil consumption available in liters)',
                        parameters: [
                            'TE<sub>SC</sub> = Total energy consumed by the stationary combustion of fuel(TJ) ',
                            'FC<sub>n</sub> = fuel consumed by the stationary combustion using fuel type n per year(kg) ',
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: 'E<sub>SC</sub> = (((EF<sub>CO<sub>2</sub>, SC, n</sub> x GWP<sub>CO<sub>2</sub></sub>)/1000) X TE<sub>SC</sub>) + (((EF<sub>CH<sub>4</sub>, SC, n</sub> x GWP<sub>CH<sub>4</sub></sub>)/1000) X TE<sub>SC</sub>) + (((EF<sub>N<sub>2</sub>O, SC, n</sub> x GWP<sub>N<sub>2</sub>O</sub>)/1000) X TE<sub>SC</sub>) ',
                        header1: '',
                        header2: 'Emission calculation using energy consumption ',
                        parameters: [
                            'E<sub>SC</sub> = Total GHG emissions from the stationary combustion (tCO<sub>2</sub>e/year) ',
                            'TE<sub>SC</sub>= Total energy consumed by the stationary combustion (TJ) ',
                            'EF<sub>CO<sub>2</sub>, SC, n</sub> = Emission factor for CO<sub>2</sub> from stationary combustion of fuel n (kg CO<sub>2</sub>/ TJ) ',
                            'EF<sub>CH<sub>4</sub>, SC, n</sub> = Emission factor for CH<sub>4</sub> from stationary combustion of fuel n (kg CH<sub>4</sub>/ TJ) ',
                            'EF<sub>N<sub>2</sub>O, SC, n</sub> = Emission factor for N<sub>2</sub>O from stationary combustion of fuel n (kg N<sub>2</sub>O / TJ) ',
                            'GWP<sub>CO<sub>2</sub></sub> = Global warming potential for CO<sub>2</sub>  ',
                            'GWP<sub>CH<sub>4</sub></sub> = Global warming potential for CH<sub>4</sub> ',
                            'GWP<sub>N<sub>2</sub>O</sub> = Global warming potential for N<sub>2</sub>O '
                        ]
                    },
                ]
            },
            [sourceName.Waste_water_treatment]: {
                equations: [
                    {
                        equation: 'TOD = (TIP X WG X COD) ',
                        header1: '',
                        header2: '',
                        parameters: [
                            'TIP = Total industry product (t/yr)',
                            'WG = Waste generated (m<sup>3</sup>/t)',
                            'COD = Chemical Oxygen Demand (kg COD/m<sup>3</sup>)',
                            'TOD = Total organic degradable material in wastewater for each industry sector (kg COD/yr)'
                        ]
                    },
                    {
                        equation: 'EF = (MCF X MMPC)',
                        header1: '',
                        header2: '',
                        parameters: [
                            'MCF = Methane Correction Factor for the Treatment System (MCF)',
                            'MMPC = Maximum Methane Producing Capacity (kgCH4/kg COD)',
                            'EF = Emission Factor (kg CH4/kg COD)'
                        ]
                    },
                    {
                        equation: 'NME = ((TOD - SR) X EF) - RCH',
                        header1: '',
                        header2: '',
                        parameters: [
                            'SR = Sludge removed in each industry sector (kg COD/yr)',
                            'RCH = Recovered CH<sub>4</sub> in each industry sector (kg CH<sub>4</sub>/yr)',
                            'NME = Net methane emissions (kg CH<sub>4</sub>/yr)'
                        ]
                    },
                    {
                        equation: 'NGE = (NME/1000) X 28',
                        header1: '',
                        header2: '',
                        parameters: [
                            'NGE = Net GHG emissions (tCO<sub>2</sub>e/yr)'
                        ]
                    },
                ]
            },
            [sourceName.cooking_gas]: {
                equations: [
                    {
                        equation: '<br>TE = ((W) /1000) X NCV<sub>LPG</sub>',
                        header1: 'Equation for LP gas',
                        header2: '',
                        parameters: [
                            'TE = Total energy (TJ)',
                            'W = Weight (kg)',
                            'NCV<sub>LPG</sub> = Net Calorific Value of Lpgas (TJ/tons)'
                        ]
                    },
                    {
                        equation: '<br>E = (((EF<sub>CO<sub>2</sub>,M,Lpgas</sub> x GWP<sub>CO<sub>2</sub></sub>) + (EF<sub>CH<sub>4</sub>,M,Lpgas</sub> x GWP<sub>CH<sub>4</sub></sub>) + (EF<sub>N<sub>2</sub>O,M,Lpgas</sub> x GWP<sub>N<sub>2</sub>O</sub>))/1000) x TE) ',
                        header1: '',
                        header2: 'Emission calculation using energy consumption ',
                        parameters: [
                            'E =  Emissions (tCO<sub>2</sub>e)  ', 
                            'TE<sub>MC</sub>= Total energy consumed by the mobile combustion (TJ)  ', 
                            'EF<sub>CO<sub>2</sub>,M,Lpgas</sub> = Emission factor for CO<sub>2</sub> from mobile combustion of  fuel Lpgas (kg CO<sub>2</sub>/ TJ) ',
                            'EF<sub>CH<sub>4</sub>,M,Lpgas</sub>= Emission factor for CH<sub>4</sub> from mobile combustion of  fuel Lpgas(kg CH<sub>4</sub>/ TJ) ',
                            'EF<sub>N<sub>2</sub>O,M,Lpgas</sub> = Emission factor for N<sub>2</sub>O from mobile combustion of fuel Lpgas (kg N<sub>2</sub>O / TJ) ',
                            'GWP<sub>CO<sub>2</sub></sub> = Global warming potential for CO<sub>2</sub> ',
                            'GWP<sub>CH<sub>4</sub></sub> = Global warming potential for CH<sub>4</sub> ',
                            'GWP<sub>N<sub>2</sub>O</sub> = Global warming potential for N<sub>2</sub>O '
                        ]
                    },
                    {
                        equation: '<br>TE = ((W) /1000) X NCV<sub>LPG</sub>',
                        header1: 'Equation for Biogas',
                        header2: '',
                        parameters: [
                            'TE = Total energy (TJ)',
                            'W = Weight (kg)',
                            'NCV<sub>Biogas</sub> = Net Calorific Value of Biogas (TJ/tons)'
                        ]
                    },
                    {
                        equation: '<br>E = (((EF<sub>CO<sub>2</sub>,M,Biogas</sub> x GWP<sub>CO<sub>2</sub></sub>) + (EF<sub>CH<sub>4</sub>,M,Biogas</sub> x GWP<sub>CH<sub>4</sub></sub>) + (EF<sub>N<sub>2</sub>O,M,Biogas</sub> x GWP<sub>N<sub>2</sub>O</sub>))/1000) x TE) ',
                        header1: '',
                        header2: 'Emission calculation using energy consumption ',
                        parameters: [
                            'E =  Emissions (tCO<sub>2</sub>e)  ', 
                            'TE<sub>MC</sub>= Total energy consumed by the mobile combustion (TJ)  ', 
                            'EF<sub>CO<sub>2</sub>,M,Biogas</sub> = Emission factor for CO<sub>2</sub> from mobile combustion of  fuel Biogas (kg CO<sub>2</sub>/ TJ) ',
                            'EF<sub>CH<sub>4</sub>,M,Biogas</sub>= Emission factor for CH<sub>4</sub> from mobile combustion of  fuel Biogas(kg CH<sub>4</sub>/ TJ) ',
                            'EF<sub>N<sub>2</sub>O,M,Biogas</sub> = Emission factor for N<sub>2</sub>O from mobile combustion of fuel Biogas (kg N<sub>2</sub>O / TJ) ',
                            'GWP<sub>CO<sub>2</sub></sub> = Global warming potential for CO<sub>2</sub> ',
                            'GWP<sub>CH<sub>4</sub></sub> = Global warming potential for CH<sub>4</sub> ',
                            'GWP<sub>N<sub>2</sub>O</sub> = Global warming potential for N<sub>2</sub>O '
                        ]
                    },
                ]
            },
            [sourceName.WeldingEs]: {
                equations: [
                    {
                        equation: 'E = AC x EF<sub>aceytelene</sub>',
                        header1: 'Equation for Aceytelene',
                        header2: '',
                        parameters: [
                            'E = Emission (tCO<sub>e</sub>)',
                            'AC = Aceytelene consumption (kg)',
                            'EF<sub>aceytelene</sub> = Emission factor for Aceytelene'
                        ]
                    },
                    {
                        equation: 'E = LC x EF<sub>L,CO<sub>2</sub>',
                        header1: 'Equation for Liquid CO<sub>2</sub>',
                        header2: '',
                        parameters: [
                            'E = Emission (tCO<sub>e</sub>)',
                            'LC = Liquid CO<sub>2</sub> consumption (kg)',
                            'EF<sub>L,CO<sub>2</sub> = Emission factor for Liquid CO<sub>2</sub>'
                        ]
                    },
                ]
            },
            [sourceName.freight_air]: {
                equations: [
                    {
                        equation: 'D<sub>t</sub> = D<sub>trip</sub> x Number of trips',
                        header1: 'Fuel Based',
                        header2: '',
                        parameters: [
                            'D<sub>t</sub> = Total distance traveled per month or per year (km)',
                            'D<sub>trip</sub> = Distance per trip (km)'
                        ]
                    },
                    {
                        equation: 'W<sub>t</sub> = W<sub>trip</sub> x Number of trips',
                        header1: '',
                        header2: '',
                        parameters: [
                            'W<sub>t</sub> = Total product quantity transported per month or per year (tonne)',
                            'W<sub>trip</sub> = Weight per trip (km)'
                        ]
                    },
                    {
                        equation: 'Total emission= (W<sub>t</sub> x D x EF<sub>air</sub>)/ 1000',
                        header1: '',
                        header2: '',
                        parameters: [
                            'W<sub>t</sub> = Total product quantity transported per month or per year (tonne)',
                            'D<sub>t</sub> = Total distance traveled per month or per year (km)',
                            'EF<sub>air</sub>) = Emissions factor for the air transport (kg CO2e/tonne.km)'
                        ]
                    },
                ]   
            },
            [sourceName.freight_offroad]: {
                equations: [
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub> /1000) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: ' Fuel Based Calculation',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in liters)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ',
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>E<sub>MC</sub> = (((EF<sub>CO<sub>2</sub>, MC, n</sub> X GWP<sub>CO<sub>2</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>CH<sub>4</sub>, MC, n</sub> X GWP<sub>CH<sub>4</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>N<sub>2</sub>O, MC, n</sub> X GWP<sub>N<sub>2</sub>O</sub>)/1000) X TE<sub>MC</sub>) ',
                        header1: '',
                        header2: 'Emission calculation using energy consumption ',
                        parameters: [
                            'E<sub>MC</sub> = Total GHG emissions from the mobile combustion (tCO<sub>2</sub>e/year)  ', 
                            'TE<sub>MC</sub>= Total energy consumed by the mobile combustion (TJ)  ', 
                            'EF<sub>CO<sub>2</sub> = Emission factor for CO<sub>2</sub> from mobile combustion of fuel n (kg CO<sub>2</sub>/ TJ) ',
                            'EF<sub>CH<sub>4</sub>, MC, n</sub> = Emission factor for CH<sub>4</sub> from mobile combustion of fuel n (kg CH<sub>4</sub>/ TJ) ',
                            'EF<sub>N<sub>2</sub>O, MC, n</sub> = Emission factor for N<sub>2</sub>O from mobile combustion of fuel n (kg N<sub>2</sub>O / TJ) ',
                            'GWP<sub>CO<sub>2</sub></sub> = Global warming potential for CO<sub>2</sub> ',
                            'GWP<sub>CH<sub>4</sub></sub> = Global warming potential for CH<sub>4</sub> ',
                            'GWP<sub>N<sub>2</sub>O</sub> = Global warming potential for N<sub>2</sub>O '
                        ]
                    },
                ]
            },
            [sourceName.freight_rail]: {
                equations: [
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub> /1000) x D<sub>n</sub> x NCV<sub>n</sub> ',
                        header1: 'Fuel Based Calculation',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in liters)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ',
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub>) x D<sub>n</sub> x NCV<sub>n</sub> ',
                        header1: '',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in m<sub>3</sub>)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ',
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub>/1000) x NCV<sub>n</sub> ',
                        header1: '',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in kg)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ',
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>E<sub>MC</sub> = (((EF<sub>CO<sub>2</sub>, MC, n</sub> x GWP<sub>CO<sub>2</sub></sub>)/1000) x TE<sub>MC</sub>) + (((EF<sub>CH<sub>4</sub>, MC, n</sub> x GWP<sub>CH<sub>4</sub></sub>)/1000) x TE<sub>MC</sub>) + (((EF<sub>N<sub>2</sub>O, MC, n</sub> x GWP<sub>N<sub>2</sub>O</sub>)/1000) x TE<sub>MC</sub>) ',
                        header1: '',
                        header2: 'Emission calculation using energy consumption ',
                        parameters: [
                            'E<sub>MC</sub> = Total GHG emissions from the mobile combustion (tCO<sub>2</sub>e/year)  ', 
                            'TE<sub>MC</sub>= Total energy consumed by the mobile combustion (TJ)  ', 
                            'EF<sub>CO<sub>2</sub>, MC, n</sub> = Emission factor for CO<sub>2</sub> from mobile combustion of fuel n (kg CO<sub>2</sub>/ TJ) ',
                            'EF<sub>CH<sub>4</sub>, MC, n</sub> = Emission factor for CH<sub>4</sub> from mobile combustion of fuel n (kg CH<sub>4</sub>/ TJ) ',
                            'EF<sub>N<sub>2</sub>O, MC, n</sub> = Emission factor for N<sub>2</sub>O from mobile combustion of fuel n (kg N<sub>2</sub>O / TJ) ',
                            'GWP<sub>CO<sub>2</sub></sub> = Global warming potential for CO<sub>2</sub> ',
                            'GWP<sub>CH<sub>4</sub></sub> = Global warming potential for CH<sub>4</sub> ',
                            'GWP<sub>N<sub>2</sub>O</sub> = Global warming potential for N<sub>2</sub>O '
                        ]
                    },
                    {
                        equation: '<br>TE = D<sub>trip</sub>  x W<sub>trip</sub> x Number of trips ',
                        header1: 'Distance Based Calculation',
                        header2: 'Energy consumption calculation',
                        parameters: [
                            'TE = Total energy consumed(TJ) ',
                            'D<sub>trip</sub> = Distance per trip (km)', 
                            'W<sub>trip</sub> = Weight per trip (kg) ',
                        ]
                    },
                    {
                        equation: '<br>E = (EF<sub>CO<sub>2</sub></sub> + EF<sub>CH<sub>4</sub></sub> + EF<sub>N<sub>2</sub>O</sub>) x TE /1000',
                        header1: '',
                        header2: 'Emission calculation using energy consumption',
                        parameters: [
                            'E = Emission (tCO<sub>2</sub>e/year) ',
                            'EF<sub>CO<sub>2</sub></sub> = Emission factor for CO<sub>2</sub>', 
                            'EF<sub>CH<sub>4</sub></sub>  = Emission factor for CH<sub>4</sub>',
                            'EF<sub>N<sub>2</sub>O</sub> = Emission factor for N<sub>2</sub>O'
                        ]
                    },
                ]
            },
            [sourceName.freight_road]: {
                equations: [
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub> /1000) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: 'Fuel Based Calculation',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in liters)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ',
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub>) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: '',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in m3)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ',
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>FC<sub>n</sub> = TC<sub>n</sub> x Fuel cost per liter<sub>n</sub>',
                        header1: '',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in Currency)',
                        parameters: [
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'TC<sub>n</sub> = Total cost of fuel type n per year  (LKR or Relevant currency)',
                            'Fuel cost per liter n = Fuel cost per liter of fuel type n per year (LKR/liter or Relevant currency/liter) '
                        ]
                    },
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub> /1000) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: '',
                        header2: '',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ', 
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L) ', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>E<sub>MC</sub> = (((EF<sub>CO<sub>2</sub>, MC, n</sub> X GWP<sub>CO<sub>2</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>CH<sub>4</sub>, MC, n</sub> X GWP<sub>CH<sub>4</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>N<sub>2</sub>O, MC, n</sub> X GWP<sub>N<sub>2</sub>O</sub>)/1000) X TE<sub>MC</sub>) ',
                        header1: '',
                        header2: 'Emission calculation using energy consumption ',
                        parameters: [
                            'E<sub>MC</sub> = Total GHG emissions from the mobile combustion (tCO<sub>2</sub>e/year)  ', 
                            'TE<sub>MC</sub>= Total energy consumed by the mobile combustion (TJ)  ', 
                            'EF<sub>CO<sub>2</sub> = Emission factor for CO<sub>2</sub> from mobile combustion of fuel n (kg CO<sub>2</sub>/ TJ) ',
                            'EF<sub>CH<sub>4</sub>, MC, n</sub> = Emission factor for CH<sub>4</sub> from mobile combustion of fuel n (kg CH<sub>4</sub>/ TJ) ',
                            'EF<sub>N<sub>2</sub>O, MC, n</sub> = Emission factor for N<sub>2</sub>O from mobile combustion of fuel n (kg N<sub>2</sub>O / TJ) ',
                            'GWP<sub>CO<sub>2</sub></sub> = Global warming potential for CO<sub>2</sub> ',
                            'GWP<sub>CH<sub>4</sub></sub> = Global warming potential for CH<sub>4</sub> ',
                            'GWP<sub>N<sub>2</sub>O</sub> = Global warming potential for N<sub>2</sub>O '
                        ]
                    },
                    {
                        equation: '<br>E<sub>c</sub> = D<sub>trip</sub>  x W<sub>trip</sub> x Number of trips x EF<sub>c</sub> / 1000000 ',
                        header1: 'Distance Based Calculation',
                        header2: '',
                        parameters: [
                            'E<sub>c</sub> = Total Emission (tCO<sub>2</sub>e) ',
                            'D<sub>trip</sub> = Distance per trip (km)', 
                            'W<sub>trip</sub> = Weight per trip (kg) ',
                            'EF<sub>c</sub> = Emissions factor for  cargo type c (gCO<sub>2</sub>/tonne.km) '
                        ]
                    },
                ]
            },
            [sourceName.freight_water]: {
                equations: [
                    {
                        equation: '<br>Emission (tCO<sub>2</sub>e) = {Fuel consumption (tonne) x Emission Factor (kgCO<sub>2</sub>e/tonne)}/1000',
                        header1: 'Fuel based calculation',
                        header2: 'Emission calculation if fuel consumption available in tonne',
                        parameters: []
                    },
                    {
                        equation: '<br>Emission (tCO<sub>2</sub>e) = {Fuel consumption (liters) x Emission Factor (kgCO<sub>2</sub>e/liters)}/1000',
                        header1: 'Fuel based calculation',
                        header2: 'Emission calculation if fuel consumption available in liters',
                        parameters: []
                    },
                    {
                        equation: '<br>Emission (tCO<sub>2</sub>e) = {Fuel consumption (kWh (Net CV)) x Emission Factor (kgCO<sub>2</sub>e/kWh (NetCV))}/1000',
                        header1: 'Fuel based calculation',
                        header2: 'Emission calculation if fuel consumption available in kWh (Net CV)',
                        parameters: []
                    },
                    {
                        equation: '<br>Emission (tCO<sub>2</sub>e) = {Fuel consumption (kWh (Gross CV)) x Emission Factor (kgCO<sub>2</sub>e/kWh (Gross CV))}/1000',
                        header1: 'Fuel based calculation',
                        header2: 'Emission calculation if fuel consumption available in kWh (Gross CV)',
                        parameters: []
                    },
                    {
                        equation: '<br>E = D<sub>trip</sub>  x W<sub>trip</sub> x Number of trips x EF<sub>sea</sub> / 1000 ',
                        header1: 'Distance Based Calculation',
                        header2: 'Emission calculation if distance available in km',
                        parameters: [
                            'E = Total emission (tCO<sub>2</sub>e)',
                            'D<sub>trip</sub> = Distance per trip (km)', 
                            'W<sub>trip</sub> = Weight per trip (kg) ',
                            'EF<sub>sea</sub> = Emissions factor based on activity, type and size of the ship (kgCO2e/tonne.km) '
                        ]
                    },
                    {
                        equation: '<br>Distance (km) = (Distance in Nautical mile (NM) x 1.852) ',
                        header1: '',
                        header2: 'Emission calculation if distance available in Nm',
                        parameters: []
                    },
                    {
                        equation: '<br>E = D<sub>trip</sub>  x W<sub>trip</sub> x Number of trips x EF<sub>sea</sub> / 1000 ',
                        header1: '',
                        header2: '',
                        parameters: [
                            'E = Total emission (tCO<sub>2</sub>e)',
                            'D<sub>trip</sub> = Distance per trip (km)', 
                            'W<sub>trip</sub> = Weight per trip (kg) ',
                            'EF<sub>sea</sub> = Emissions factor based on activity, type and size of the ship (kgCO2e/tonne.km) '
                        ]
                    },
                ]
            },
            [sourceName.passenger_offroad]: {
                equations: [
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub> /1000) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: 'Fuel Based Calculation',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in liters)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ',
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub>) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: '',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in m3)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ',
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>FC<sub>n</sub> = TC<sub>n</sub> x Fuel cost per liter<sub>n</sub>',
                        header1: '',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in Currency)',
                        parameters: [
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'TC<sub>n</sub> = Total cost of fuel type n per year  (LKR or Relevant currency)',
                            'Fuel cost per liter n = Fuel cost per liter of fuel type n per year (LKR/liter or Relevant currency/liter) '
                        ]
                    },
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub> /1000) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: '',
                        header2: '',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ', 
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L) ', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>E<sub>MC</sub> = (((EF<sub>CO<sub>2</sub>, MC, n</sub> X GWP<sub>CO<sub>2</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>CH<sub>4</sub>, MC, n</sub> X GWP<sub>CH<sub>4</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>N<sub>2</sub>O, MC, n</sub> X GWP<sub>N<sub>2</sub>O</sub>)/1000) X TE<sub>MC</sub>) ',
                        header1: '',
                        header2: 'Emission calculation using energy consumption ',
                        parameters: [
                            'E<sub>MC</sub> = Total GHG emissions from the mobile combustion (tCO<sub>2</sub>e/year)  ', 
                            'TE<sub>MC</sub>= Total energy consumed by the mobile combustion (TJ)  ', 
                            'EF<sub>CO<sub>2</sub> = Emission factor for CO<sub>2</sub> from mobile combustion of fuel n (kg CO<sub>2</sub>/ TJ) ',
                            'EF<sub>CH<sub>4</sub>, MC, n</sub> = Emission factor for CH<sub>4</sub> from mobile combustion of fuel n (kg CH<sub>4</sub>/ TJ) ',
                            'EF<sub>N<sub>2</sub>O, MC, n</sub> = Emission factor for N<sub>2</sub>O from mobile combustion of fuel n (kg N<sub>2</sub>O / TJ) ',
                            'GWP<sub>CO<sub>2</sub></sub> = Global warming potential for CO<sub>2</sub> ',
                            'GWP<sub>CH<sub>4</sub></sub> = Global warming potential for CH<sub>4</sub> ',
                            'GWP<sub>N<sub>2</sub>O</sub> = Global warming potential for N<sub>2</sub>O '
                        ]
                    },
                    {
                        equation: '<br>TE<sub>MC</sub> = (((d<sub>i</sub>/FE<sub>i</sub>)*No of trips) /1000) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: 'Distance Based Calculation',
                        header2: 'Energy consumption calculation (If, distance and fuel economy are  given)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ', 
                            'd<sub>i</sub> = distance traveled by vehicle i per trip (km)  ', 
                            'FE<sub>i</sub> = Fuel economy of vehicle I (km/l)',
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>E<sub>MC</sub> = (((EF<sub>CO<sub>2</sub>, MC, n</sub> X GWP<sub>CO<sub>2</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>CH<sub>4</sub>, MC, n</sub> X GWP<sub>CH<sub>4</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>N<sub>2</sub>O, MC, n</sub> X GWP<sub>N<sub>2</sub>O</sub>)/1000) X TE<sub>MC</sub>) ',
                        header1: '',
                        header2: 'Emission calculation using energy consumption ',
                        parameters: [
                            'E<sub>MC</sub> = Total GHG emissions from the mobile combustion (tCO<sub>2</sub>e/year)  ', 
                            'TE<sub>MC</sub>= Total energy consumed by the mobile combustion (TJ)  ', 
                            'EF<sub>CO<sub>2</sub> = Emission factor for CO<sub>2</sub> from mobile combustion of fuel n (kg CO<sub>2</sub>/ TJ) ',
                            'EF<sub>CH<sub>4</sub>, MC, n</sub> = Emission factor for CH<sub>4</sub> from mobile combustion of fuel n (kg CH<sub>4</sub>/ TJ) ',
                            'EF<sub>N<sub>2</sub>O, MC, n</sub> = Emission factor for N<sub>2</sub>O from mobile combustion of fuel n (kg N<sub>2</sub>O / TJ) ',
                            'GWP<sub>CO<sub>2</sub></sub> = Global warming potential for CO<sub>2</sub> ',
                            'GWP<sub>CH<sub>4</sub></sub> = Global warming potential for CH<sub>4</sub> ',
                            'GWP<sub>N<sub>2</sub>O</sub> = Global warming potential for N<sub>2</sub>O '
                        ]
                    },
                ]
            },
            [sourceName.passenger_rail]: {
                equations: [
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub> /1000) x D<sub>n</sub> x NCV<sub>n</sub> ',
                        header1: 'Fuel Based Calculation',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in liters)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ',
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub>) x D<sub>n</sub> x NCV<sub>n</sub> ',
                        header1: '',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in m<sub>3</sub>)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ',
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub>/1000) x NCV<sub>n</sub> ',
                        header1: '',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in kg)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ',
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>FC<sub>n</sub> = TC<sub>n</sub> x Fuel cost per liter<sub>n</sub> ',
                        header1: '',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in currency)',
                        parameters: [
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)',
                            'TC<sub>n</sub> = Total cost of fuel type n per year  (LKR or Relevant currency)', 
                            'Fuel cost per liter n = Fuel cost per liter of fuel type n per year (LKR/liter or Relevant currency/liter) ',
                        ]
                    },
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub> /1000) x D<sub>n</sub> x NCV<sub>n</sub> ',
                        header1: '',
                        header2: '',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ',
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>E<sub>MC</sub> = (((EF<sub>CO<sub>2</sub>, MC, n</sub> x GWP<sub>CO<sub>2</sub></sub>)/1000) x TE<sub>MC</sub>) + (((EF<sub>CH<sub>4</sub>, MC, n</sub> x GWP<sub>CH<sub>4</sub></sub>)/1000) x TE<sub>MC</sub>) + (((EF<sub>N<sub>2</sub>O, MC, n</sub> x GWP<sub>N<sub>2</sub>O</sub>)/1000) x TE<sub>MC</sub>) ',
                        header1: '',
                        header2: 'Emission calculation using energy consumption ',
                        parameters: [
                            'E<sub>MC</sub> = Total GHG emissions from the mobile combustion (tCO<sub>2</sub>e/year)  ', 
                            'TE<sub>MC</sub>= Total energy consumed by the mobile combustion (TJ)  ', 
                            'EF<sub>CO<sub>2</sub>, MC, n</sub> = Emission factor for CO<sub>2</sub> from mobile combustion of fuel n (kg CO<sub>2</sub>/ TJ) ',
                            'EF<sub>CH<sub>4</sub>, MC, n</sub> = Emission factor for CH<sub>4</sub> from mobile combustion of fuel n (kg CH<sub>4</sub>/ TJ) ',
                            'EF<sub>N<sub>2</sub>O, MC, n</sub> = Emission factor for N<sub>2</sub>O from mobile combustion of fuel n (kg N<sub>2</sub>O / TJ) ',
                            'GWP<sub>CO<sub>2</sub></sub> = Global warming potential for CO<sub>2</sub> ',
                            'GWP<sub>CH<sub>4</sub></sub> = Global warming potential for CH<sub>4</sub> ',
                            'GWP<sub>N<sub>2</sub>O</sub> = Global warming potential for N<sub>2</sub>O '
                        ]
                    },
                    {
                        equation: '<br>TE<sub>MC</sub> = (((d<sub>i</sub>/FE<sub>i</sub>)*No of trips) /1000) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: 'Distance Based Calculation',
                        header2: 'Energy consumption calculation (If, distance and fuel economy are  given)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ', 
                            'd<sub>i</sub> = distance traveled by vehicle i per trip (km)  ', 
                            'FE<sub>i</sub> = Fuel economy of vehicle I (km/l)',
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>E<sub>MC</sub> = (((EF<sub>CO<sub>2</sub>, MC, n</sub> X GWP<sub>CO<sub>2</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>CH<sub>4</sub>, MC, n</sub> X GWP<sub>CH<sub>4</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>N<sub>2</sub>O, MC, n</sub> X GWP<sub>N<sub>2</sub>O</sub>)/1000) X TE<sub>MC</sub>) ',
                        header1: '',
                        header2: 'Emission calculation using energy consumption ',
                        parameters: [
                            'E<sub>MC</sub> = Total GHG emissions from the mobile combustion (tCO<sub>2</sub>e/year)  ', 
                            'TE<sub>MC</sub>= Total energy consumed by the mobile combustion (TJ)  ', 
                            'EF<sub>CO<sub>2</sub> = Emission factor for CO<sub>2</sub> from mobile combustion of fuel n (kg CO<sub>2</sub>/ TJ) ',
                            'EF<sub>CH<sub>4</sub>, MC, n</sub> = Emission factor for CH<sub>4</sub> from mobile combustion of fuel n (kg CH<sub>4</sub>/ TJ) ',
                            'EF<sub>N<sub>2</sub>O, MC, n</sub> = Emission factor for N<sub>2</sub>O from mobile combustion of fuel n (kg N<sub>2</sub>O / TJ) ',
                            'GWP<sub>CO<sub>2</sub></sub> = Global warming potential for CO<sub>2</sub> ',
                            'GWP<sub>CH<sub>4</sub></sub> = Global warming potential for CH<sub>4</sub> ',
                            'GWP<sub>N<sub>2</sub>O</sub> = Global warming potential for N<sub>2</sub>O '
                        ]
                    },
                    {
                        equation: '<br>E<sub>MC</sub> = ((Passenger km x No of trips) x EF<sub>per passenger km</sub>)/1000',
                        header1: '',
                        header2: 'Energy consumption calculation (If, distance is available in passenger km)',
                        parameters: [
                            'E<sub>MC</sub> = Total emissions by the mobile combustion(TJ) ', 
                            'Passenger km = distance traveled by a passenger per trip (passenger km)   ', 
                            'EF per passenger km = Emission factor per passenger km (kgCO<sub>2</sub>e /passenger km)'
                        ]
                    },
                ]
            },
            [sourceName.passenger_water]: {
                equations: [
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub> /1000) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: 'Fuel Based Calculation',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in liters)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ',
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub>) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: '',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in m3)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ',
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>E<sub>MC</sub> = (((EF<sub>CO<sub>2</sub>, MC, n</sub> X GWP<sub>CO<sub>2</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>CH<sub>4</sub>, MC, n</sub> X GWP<sub>CH<sub>4</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>N<sub>2</sub>O, MC, n</sub> X GWP<sub>N<sub>2</sub>O</sub>)/1000) X TE<sub>MC</sub>) ',
                        header1: '',
                        header2: 'Emission calculation using energy consumption ',
                        parameters: [
                            'E<sub>MC</sub> = Total GHG emissions from the mobile combustion (tCO<sub>2</sub>e/year)  ', 
                            'TE<sub>MC</sub>= Total energy consumed by the mobile combustion (TJ)  ', 
                            'EF<sub>CO<sub>2</sub> = Emission factor for CO<sub>2</sub> from mobile combustion of fuel n (kg CO<sub>2</sub>/ TJ) ',
                            'EF<sub>CH<sub>4</sub>, MC, n</sub> = Emission factor for CH<sub>4</sub> from mobile combustion of fuel n (kg CH<sub>4</sub>/ TJ) ',
                            'EF<sub>N<sub>2</sub>O, MC, n</sub> = Emission factor for N<sub>2</sub>O from mobile combustion of fuel n (kg N<sub>2</sub>O / TJ) ',
                            'GWP<sub>CO<sub>2</sub></sub> = Global warming potential for CO<sub>2</sub> ',
                            'GWP<sub>CH<sub>4</sub></sub> = Global warming potential for CH<sub>4</sub> ',
                            'GWP<sub>N<sub>2</sub>O</sub> = Global warming potential for N<sub>2</sub>O '
                        ]
                    },
                ]
            },
            [sourceName.offroad_machinery]: {
                equations: [
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub> /1000) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: 'Fuel Based Calculation',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in liters)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ',
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>TE<sub>MC</sub> = (FC<sub>n</sub>) X D<sub>n</sub> X NCV<sub>n</sub> ',
                        header1: '',
                        header2: 'Energy consumption calculation (If, Fuel consumption available in m3)',
                        parameters: [
                            'TE<sub>MC</sub> = Total energy consumed by the mobile combustion(TJ) ',
                            'FC<sub>n</sub> = Fuel consumed by the mobile combustion using fuel type n per year(L)', 
                            'D<sub>n</sub> = Density of the fuel type n (t/m<sup>3</sup>) ',
                            'NCV<sub>n</sub> = Net calorific value of the fuel type n(TJ/t) '
                        ]
                    },
                    {
                        equation: '<br>E<sub>MC</sub> = (((EF<sub>CO<sub>2</sub>, MC, n</sub> X GWP<sub>CO<sub>2</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>CH<sub>4</sub>, MC, n</sub> X GWP<sub>CH<sub>4</sub></sub>)/1000) X TE<sub>MC</sub>) + (((EF<sub>N<sub>2</sub>O, MC, n</sub> X GWP<sub>N<sub>2</sub>O</sub>)/1000) X TE<sub>MC</sub>) ',
                        header1: '',
                        header2: 'Emission calculation using energy consumption ',
                        parameters: [
                            'E<sub>MC</sub> = Total GHG emissions from the mobile combustion (tCO<sub>2</sub>e/year)  ', 
                            'TE<sub>MC</sub>= Total energy consumed by the mobile combustion (TJ)  ', 
                            'EF<sub>CO<sub>2</sub> = Emission factor for CO<sub>2</sub> from mobile combustion of fuel n (kg CO<sub>2</sub>/ TJ) ',
                            'EF<sub>CH<sub>4</sub>, MC, n</sub> = Emission factor for CH<sub>4</sub> from mobile combustion of fuel n (kg CH<sub>4</sub>/ TJ) ',
                            'EF<sub>N<sub>2</sub>O, MC, n</sub> = Emission factor for N<sub>2</sub>O from mobile combustion of fuel n (kg N<sub>2</sub>O / TJ) ',
                            'GWP<sub>CO<sub>2</sub></sub> = Global warming potential for CO<sub>2</sub> ',
                            'GWP<sub>CH<sub>4</sub></sub> = Global warming potential for CH<sub>4</sub> ',
                            'GWP<sub>N<sub>2</sub>O</sub> = Global warming potential for N<sub>2</sub>O '
                        ]
                    },
                ]
            },
            [sourceName.t_n_d_loss]: {
                equations: [
                    {
                        equation: '<br>Loss = (((Percentage/100) x value) / (1 - (Percentage/100))) x EF<sub>GE ',
                        header1: '',
                        header2: '',
                        parameters: [
                            'Loss = Transmission and distribution loss',
                            'Percentage = Percentage transmission and distribution loss',
                            'EF<sub>GE</sub> = Emission factor for grid electricity (tCO<sub>2e</sub>/ MWh)'
                        ]
                    }
                ]
            }
        }
    }

    set equations(value) {
        this._equations = value;
    }

    get equations() {
        return this._equations;
    }

    // generateEquation(source: string){
    //     let data = this.equations[source]
    //     let equation = ''
    //     data.operators.sort((a: any, b: any) => a.order - b.order);
    //     for (let operator of data.operators) {
    //         if (operator.order === 0){
    //             equation = operator.factor + operator.operator
    //         } else {
    //             equation += "(" + operator.operator + operator.factor + ")"
    //         }
    //     }

    //     return equation
    // }

    generateEquation(source: string){
        return this.equations[source]
    }



}
