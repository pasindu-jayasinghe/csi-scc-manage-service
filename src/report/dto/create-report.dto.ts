export class CreateReportDto {
  generateReportName: string = `reportPDF`
  reportName: string = `report.pdf`
  companyName: string = "Commercial Bank of Ceylon PLC";
  companyLogoLink: string = "http://localhost:7080/report/cover/logo.png";

  climateSIName: string = "Climate Smart Initiatives (Pvt.) Ltd";
  climateSILogoLink: string = "http://localhost:7080/report/cover/climatesi_logo.png";
  baseYear: string = "2020";
  inventryYear: string = "2020";
  coverAndSecondPage: coverAndSecondPage = new coverAndSecondPage();
  exicutiveSummery: exicutiveSummery = new exicutiveSummery();
  tableOfContent: tableOfContent = new tableOfContent();
  listOfTableandlistOfFigures: listOfTableandlistOfFigures = new listOfTableandlistOfFigures();
  glossaryOfTerms: glossaryOfTerms = new glossaryOfTerms();
  introduction: introduction = new introduction();
  boundries: boundries = new boundries();
  quantification: quantification = new quantification();
  result: result = new result();
  comparison: comparison = new comparison();
  conclution: conclution = new conclution();
  recomendation: recomendation = new recomendation();
  ongoinGhgMitigation: ongoinGhgMitigation = new ongoinGhgMitigation();
  nextSteps: nextSteps = new nextSteps();
  annex: annex = new annex();
}

export class coverAndSecondPage {
  companyBaseYear = "2020"
  coverImageLink = "http://localhost:7080/report/cover/cover_image.png"

  //page_1
  companyAdressLine1 = ""
  companyAdressLine2 = ""
  companyAdressLine3 = ""
  companyregistrationNumber = ""
  companyEmailAdress = ""
  companyFax = ""
  companyTelephone = ""

  climateSiAdressLine1 = "550/9, Isuru Uyana, "
  climateSiAdressLine2 = "Pelawaththa,"
  climateSiAdressLine3 = "baththaramulla"
  climateSiRegistrationNumber = "PV 119397"
  climateSiEmail = "info@climatesi.com"
  climateSiFax = "+94(011)2 075 264"
  climateSitelephone = "+94(011)2 075 264"

  version = ""
}

export class exicutiveSummery {
  //page_1
  sector = "organization"
  country = "Sri Lanka"
  emissionType = "GHG emission"
  consicitiveYear = "the fourth consecutive year"
  timePiriod = "2020 (1st January 2020 – 31st December 2020)"
  boundry = `The boundary of this assessment is "add company name" covering the head office, 268 branches Island wide, holiday homes, quarters .`
  accordance = "ISO 14064-1-2018 and United Nations Intergovernmental Panel on Climate Change’s (IPCC) Fifth Assessment Report (AR5)."
  paragraph_1 = "Data collection from organization was also quite complete, but there is still room for improvement of the data related to indirect GHG emissions. "
  figure_1_link = "http://localhost:7080/report/figures/figure1.png"

  //page_2
  emission_amount = "9,490 tCO2e"
  capitaEmission = "1.99 tCO2e"
  intensityEmission = "0.06 tCO2e"

  figure_2_link = "http://localhost:7080/report/figures/figure2.png"

  highest_emission = "grid connected electricity (6,024 tCO2e, 63%)"
  second_highest_emission = "employee commuting not paid by the company (1,320 tCO2e, 14%)"
  third_emission = "transmission and distribution loss of electricity (602 tCO2e, 6%)"
public boundyParagrap(numOfBranches:number,companyName:string){
  this.boundry=numOfBranches==0?``:`The boundary of this assessment is ${companyName} covering the head office, and ${numOfBranches} branches.`
}
  public generateFigureLink(projectId: number, unitId: number){
    this.figure_1_link = `http://localhost:7080/report/figures/figure_u${unitId}_p${projectId}_f1.png`
    this.figure_2_link = `http://localhost:7080/report/figures/figure_u${unitId}_p${projectId}_f2.png`
  }

  public generateCountryList(countries){
    this.country =  countries
      .map((a, index_a) => {
        if (index_a == countries.length - 1) {
          return ' and ' + a;
        } else {
          return a + ',';
        }
      })
      .join('')
  }
}

export class tableOfContent {

}

export class listOfTableandlistOfFigures {

}

export class glossaryOfTerms {
  glossaryOfTermsTable = [{
    title: "Business air travel",
    description: "Indirect GHG emission source attributed to the business air travels Indirect GHG emission source attributed to the business air travels"
  },
  {
    title: "Company owned vehicles",
    description: "Direct GHG emission source attributed to company own motor bikes, cars, vans, and lorries"
  },
  {
    title: "Employee commuting not paid by the company ",
    description: "Indirect GHG emission source attributed to diesel and petrol consumption of the private and public vehicles use for employee commuting which don't receive payment for fuel "
  },
  {
    title: "Employee transport paid by the company ",
    description: "Direct GHG emission source attributed to diesel and petrol consumption of the private and public vehicles use for employee commuting which receive payment for fuel "
  },
  {
    title: "Fire extinguishers ",
    description: "Direct GHG emission source attributed to use of fire extinguishers  "
  },
  {
    title: "Grid connected electricity ",
    description: "Indirect GHG emission source attributed to use of electricity transmitted and distributed by Ceylon electricity board "
  },
  {
    title: "Hired Vehicles ",
    description: "Indirect GHG emission source attributed to transport by hired vehicles "
  },
  {
    title: "LPG ",
    description: "Direct GHG emission source attributed to the LPG burning "
  },
  {
    title: "Municipal water ",
    description: "Indirect emission source attributed to municipal water consumption"
  },
  {
    title: "Refrigerant leakages   ",
    description: "Direct GHG emission source attributed to refrigerant leakage   "
  },
  {
    title: "Stand by diesel generators  ",
    description: "Direct GHG emission source attributed to use of diesel in generators "
  },
  {
    title: "Transmission and distribution (T&D) loss ",
    description: "Indirect GHG emission source attributed to the transmission and distribution loss of electricity  "
  },
  {
    title: "Paper waste disposal  ",
    description: "Indirect GHG emission source attributed to the disposal of paper waste "
  },
  ]
}

export class introduction {
  // page_one
  reportTimePeriod = "01st January 2020 – 31st December 2020 (the inventory year - IY 2020)"
  proposalNumber = "ClimateSI/MRV/2020/07"
  proposalDate = "31st July 2019 "
  principle = "the ISO standard (ISO 14064‐1 ‐2018 “Specification with guidance at the organizational level for the quantification and reporting of greenhouse gas emissions and removals”) "

  // page_two
  introduction = "Commercial Bank PLC is the largest private sector Commercial Bank and the third largest Bank in Sri Lanka in terms of total assets. The Bank is committed to sustainability of operations by mitigating any adverse effects on the environment. By taking proactive steps to measure, manage, report and reduce its GHG emissions, the Bank is demonstrating the leadership and commitment to address the risks associated with climate change."
  responsible = "AGM- Services and the Executive officer (Eng.) of the Premises Department are responsible for conducting the GHG inventory of the Bank. "
  policy = "The Bank measures and reports its GHG emissions voluntarily since 2017 even without a dissemination policy in place for the GHG inventory. Annual reports will include the detail of GHG emissions and disseminate among the stakeholders."


  // page_three
  underbaseYear = "the third attempt to quantify the carbon footprint taking into account all direct and indirect emissions in line with ISO 14064-1 standard"

  public generateUnderbaseyear(attempt, standard){
    this.underbaseYear = `the ${attempt} attempt to quantify the carbon footprint taking into account all direct and indirect emissions in line with ${standard} standard`
  }

  public generateResponsiblePerson(str){
    this.responsible = `${str} are responsible for conducting the GHG inventory of the Bank. `
  }

}

export class boundries {
  // #page_one
  approach="control approach";
  approach_paragraph_1=""
  approach_paragraph_2 = ""
  // #page_two
  paragraph_2 = ""
  direct_indirect_table=[{direct:'',indirect:''}]
  figure_2_link = "http://localhost:7080/report/figures/figure3.png"

  public generateFigureLink(projectId: number, unitId: number){
    this.figure_2_link = `http://localhost:7080/report/figures/figure_u${unitId}_p${projectId}_f3.png`
  }

public genarateBoundiesApproach(approach:string,approach_paragraph_1:string,approach_paragraph_2:string){

  this.approach=approach;
  this.approach_paragraph_1=approach_paragraph_1;
  this.approach_paragraph_2=approach_paragraph_2;
}

  public genarateBoundiesParagraphtwo(behavior:string,emission:number){

    this.paragraph_2=`Indirect emissions which is ${behavior} ${emission}tCO2e will not be taken in to account`;
  }
}

export class quantification {
  // page_one
  // page_one
  consicitiveYear = 'the fourth consecutive year';
  gwp = 'per the IPCC 5th assessment report (CO₂ -1, CH₄ -28, N₂O- 265)';
  paragraph_1 =
    ' Collection of activity data was primarily done through the central data base, invoices, logbooks and utility bills';
  //page_two
  //page_two
  direct_emisions: any[] = [];

  //page_3
  direct_emisions_2: any[] = [] ;

  direct_emisions_3: any[] = [];
  direct_emisions_4: any[] = [];
  direct_emisions_5: any[] = [];

  //allemfacs
  allEmissionFacs = [{ tableName: '', data: [] }];

  //defra - table 1
  defra = [
    {
      es: 'waste_disposal',
      noOfCat: 1,
      numOfRow: 14,
      category1: [
        {
          name: 'Soils',
          subcat: [
            {
              name: 'reUse',
              quantity: null,
              unit: '',
            },
            {
              name: 'openLoop',
              quantity: null,
              unit: '',
            },
            {
              name: 'closedLoop',
              quantity: 0.98470835,
              unit: '',
            },
            {
              name: 'combution',
              quantity: null,
              unit: '',
            },
            {
              name: 'composting',
              quantity: null,
              unit: '',
            },

            {
              name: 'landFill',
              quantity: 17.5771404492864,
              unit: '',
            },
            {
              name: 'AnaeriobicDigestions',
              quantity: null,
              unit: '',
            },
          ],
        },
        {
          name: 'Average construction',
          subcat: [
            {
              name: 'reUse',
              quantity: null,
              unit: '',
            },
            {
              name: 'openLoop',
              quantity: 0.98470835,
              unit: '',
            },
            {
              name: 'closedLoop',
              quantity: 0.98470835,
              unit: '',
            },

            {
              name: 'combution',
              quantity: 21.2801937984496,
              unit: '',
            },
            {
              name: 'composting',
              quantity: null,
              unit: '',
            },
            {
              name: 'landFill',
              quantity: null,
              unit: '',
            },
            {
              name: 'AnaeriobicDigestions',
              quantity: null,
              unit: '',
            },
          ],
        },
      ],
    },
  ];

  defra_2: any[] = [];

  //fuelFactor - table 2
  fuelFactor = [
    {
      es: 'generator',
      noOfCat: 1,
      numOfRow: 9,
      category1: [
        {
          name: 'PETROL_95',
          subcat: [
            {
              name: 'CH₄ (Default)',
              quantity: 3,
              unit: 'Kg/TJ',
            },
            {
              name: 'CH₄ (Upper)',
              quantity: 2333,
              unit: 'Kg/TJ',
            },
            {
              name: 'CH₄ (Lower)',
              quantity: 3,
              unit: 'Kg/TJ',
            },
            {
              name: 'N₂O (Default)',
              quantity: 2,
              unit: 'Kg/TJ',
            },
            {
              name: 'n20__upper',
              quantity: 32,
              unit: 'Kg/TJ',
            },
            {
              name: 'n20_lower',
              quantity: 3,
              unit: 'Kg/TJ',
            },
            {
              name: 'co2_default',
              quantity: 43,
              unit: 'Kg/TJ',
            },
            {
              name: 'co2__upper',
              quantity: 333,
              unit: 'Kg/TJ',
            },
            {
              name: 'co2_lower',
              quantity: 4,
              unit: 'Kg/TJ',
            },
          ],
        },
      ],
    },
  ];

  fuelFactor_2: any[] = [];

  //fuelSpecific - table 3
  fuelSpecific = [
    {
      es: 'boiler',
      noOfCat: 1,
      numOfRow: 2,
      category1: [
        {
          name: 'Residual_Fuel_Oil',
          subcat: [
            {
              name: 'ncv',
              quantity: 0.0404,
              unit: '',
            },
            {
              name: 'density',
              quantity: 0.97,
              unit: '',
            },
          ],
        },
      ],
    },
  ];

  //common - table 4
  common = [
    {
      es: 'boiler',
      noOfCat: 1,
      numOfRow: 7,
      category1: [
        {
          name: 'gwp_co2',
          quantity: 1,
          unit: 'NM',
        },
        {
          name: 'gwp_ch4',
          quantity: 28,
          unit: 'NM',
        },
        {
          name: 'gwp_n2o',
          quantity: 265,
          unit: 'NM',
        },
        {
          name: 'ef_co2_Residual_Fuel_Oil',
          quantity: 77400,
          unit: 'KG',
        },
        {
          name: 'ef_ch4_Residual_Fuel_Oil',
          quantity: 3,
          unit: 'KG',
        },
        {
          name: 'ef_n2o_Residual_Fuel_Oil',
          quantity: 0.6,
          unit: 'KG',
        },
      ],
    },
  ];

  common_2: any[] = [];
  common_3: any[] = [];

  gwp_table: any[] = [{ name: '', value: '', unit: '', source: '' }];

  //transport - table 5
  transport = [
    {
      es: 'passenger_road',
      noOfCat: 1,
      numOfRow: 5,
      category1: [
        {
          name: 'BUS_DIESEL',
          subcat: [
            {
              name: 'co2',
              quantity: 0.0162032,
              unit: '',
            },

            {
              name: 'ch4',
              quantity: 0.0162032,
              unit: '',
            },

            {
              name: 'n2o',
              quantity: 0.0162032,
              unit: '',
            },

            {
              name: 'gKm',
              quantity: 0.0162032,
              unit: '',
            },

            {
              name: 'kgco2ePKm',
              quantity: 0.0162032,
              unit: '',
            },
          ],
        },
      ],
    },
  ];

  //freight_water - table 6
  freightwater = [];
  freightwater_2 = [];
  freightwater_3 = [];
  freightwater_4 = [];

    //page_6
    uncertainties_1 = [{ title: "Company own vehicles", description: ["value. These were converted to volume using the respective unit cost of the fuel type. As cost of fuel and amount of fuel are highly corelated, this only add low level of uncertainty to the assessment."] },
    { title: "Stand by generators", description: ["Commercial Bank of Ceylon PLC only records the data in monetary values. Therefore, fuel consumption was calculated based on the unit cost of the diesel. As cost of fuel and amount of fuel are highly corelated, this only add low level of uncertainty to the assessment."] },
    { title: "Employee commuting", description: ["Transferring of the employees only take place within five years period. Therefore, GHG emissions attributed to employee commuting were calculated based on the data gathered in a survey conducted in 2017 (this data was verified by the verification body in that year). However, number of working days were considered as 70% that of in 2017 based on the working arrangements of the Bank in 2020.", "Uncertainty of the assessment of this category is high as employees entered assumed data, drastic changes in the commuting methods due to travel restrictions, etc. "] },
    { title: "LPG", description: ["Amount of LPG consumed in holiday homes and staff quarters were also calculated based on the attributed cost. Retail price of gas cylinder were used for the conversion.  This may have also caused moderate uncertainty to assessment as fluctuations of retail price over the year and district wise changes of price were not considered."] },
    ]
    //page_7
    uncertainties_2 = [
        { title: "Hired Vehicles ", description: ["Hired vehicles include two categories, vehicles hired from third parties and vehicle hired from employees to uses for official purposes. ", " The Bank, only keep monetary values paid for respective third-party companies. As such, those values were converted to distance based on the agreed cost per kilometer.  These values were converted to volume of fuel based on the average fuel economy of respective vehicles as given in Table 2.", "Hired vehicles used by executives considered under two categories i) use of own petrol cars, ii) use of taxi. In a situation where own car is used, distance was calculated using entitled cost per kilometer. Taxi was categorized into cars and three wheelers based on the fare (500 LKR> Fair – Three wheel, 500 LKR< Fair – Car). Fuel consumption was calculated using respective fuel economy of the vehicle type. ", "Nonexecutives entitled to use own motor bike, or three wheels as hired vehicles. Cost attributed to each type were converted to fuel consumption based on entitle per capita cost and respective fuel economy of the vehicle. Please see Table 2 for more details. Number of assumptions made might have added high uncertainty to the assessment. "] },
        { title: "Municipal Water ", description: ["The Bank only record bill amount of the municipal water. As such bill amount was converted to consumption units of water based on unit cost and the attributed fixed charge.  This might also have caused low level of uncertainty to the assessment.  "] },
    ]
    //page_8
    emissions = [{
        emission_source: "Shared generators",
        resons: "Due to unavailability of sufficient data to quantify the GHG emissions"
    },
    {
        emission_source: "Locally transported material(stationary, water bottle, etc.)",
        resons: "Due to unavailability of sufficient data to quantify the GHG emissions"
    },
    {
        emission_source: "Emissions of client/guest transportation ",
        resons: "Due to unavailability of sufficient data to quantify the GHG emissions"
    },
    {
        emission_source: "Waste Disposal (excluding paper waste) ",
        resons: "Due to unavailability of sufficient data to quantify the GHG emissions"
    },
    {
        emission_source: "Waste transportation ",
        resons: "Due to unavailability of sufficient data to quantify the GHG emissions"
    },

    ]

    generateParagraphOne(methods) {
        this.paragraph_1 = `Collection of activity data was primarily done through the ${methods}`
    }
}

export class result {
  //page_one
  ghg_emission = [
    
    {
        "category": "Category 1: Direct Emissions",
        "isTotal": false,
        "numOfRows": 6,
        "emissions": [
            {
                "name": "generator",
                "numOfRows": 3,
                "ownership": [
                    {
                        "name": "Own/Hired",
                        "emission": {
                            "tco2e": 26.1625,
                            "co2": 26.1625,
                            "ch4": 0,
                            "n2o": 0,
                            "hfcs": 0
                        }
                    },
                    {
                        "name": "Own",
                        "emission": {
                            "tco2e": 0,
                            "co2": 0,
                            "ch4": 0,
                            "n2o": 0,
                            "hfcs": 0
                        }
                    },
                    {
                        "name": "Hired",
                        "emission": {
                            "tco2e": 0,
                            "co2": 0,
                            "ch4": 0,
                            "n2o": 0,
                            "hfcs": 0
                        }
                    }
                ]
            },
            {
                "name": "freight offroad",
                "numOfRows": 3,
                "ownership": [
                    {
                        "name": "Own/Hired",
                        "emission": {
                            "tco2e": 0,
                            "co2": 0,
                            "ch4": 0,
                            "n2o": 0,
                            "hfcs": 0
                        }
                    },
                    {
                        "name": "Own",
                        "emission": {
                            "tco2e": 0,
                            "co2": 0,
                            "ch4": 0,
                            "n2o": 0,
                            "hfcs": 0
                        }
                    },
                    {
                        "name": "Hired",
                        "emission": {
                            "tco2e": 0,
                            "co2": 0,
                            "ch4": 0,
                            "n2o": 0,
                            "hfcs": 0
                        }
                    }
                ]
            },
          
           
         
        ]
    },
    {
        "category": "Total Direct Emissions",
        "isTotal": true,
        "emissions": {
            "tco2e": 461594.1625,
            "co2": -285.8375,
            "ch4": 0,
            "n2o": 0,
            "hfcs": 0
        }
    },
    {
        "category": "Category 2: Indirect emissions from imported energy",
        "isTotal": false,
        "numOfRows": 1,
        "emissions": [
            {
                "name": "generator",
                "numOfRows": 1,
                "ownership": [
                    {
                        "name": "Rented",
                        "emission": {
                            "tco2e": 0,
                            "co2": 0,
                            "ch4": 0,
                            "n2o": 0,
                            "hfcs": 0
                        }
                    }
                ]
            }
        ]
    },
    {
        "category": "Category 3: Indirect emissions from transportation",
        "isTotal": false,
        "numOfRows": 1,
        "emissions": [
            {
                "name": "electricity",
                "numOfRows": 1,
                "ownership": [
                    {
                        "name": "Rented",
                        "emission": {
                            "tco2e": 27720,
                            "co2": 0,
                            "ch4": 0,
                            "n2o": 0,
                            "hfcs": 0
                        }
                    }
                ]
            }
        ]
    },
    {
        "category": "Category 4: Indirect emissions from services Used by the organization",
        "isTotal": false,
        "numOfRows": 2,
        "emissions": [
            {
                "name": "freight offroad",
                "numOfRows": 1,
                "ownership": [
                    {
                        "name": "Rented",
                        "emission": {
                            "tco2e": 0,
                            "co2": 0,
                            "ch4": 0,
                            "n2o": 0,
                            "hfcs": 0
                        }
                    }
                ]
            },
            {
                "name": "welding es",
                "numOfRows": 1,
                "ownership": [
                    {
                        "name": "Rented",
                        "emission": {
                            "tco2e": 0,
                            "co2": 0,
                            "ch4": 0,
                            "n2o": 0,
                            "hfcs": 0
                        }
                    }
                ]
            }
        ]
    },
    {
        "category": "Category 5: Indirect emissions from other sources",
        "isTotal": false,
        "numOfRows": 1,
        "emissions": [
            {
                "name": "cooking gas",
                "numOfRows": 1,
                "ownership": [
                    {
                        "name": "Rented",
                        "emission": {
                            "tco2e": 0,
                            "co2": 0,
                            "ch4": 0,
                            "n2o": 0,
                            "hfcs": 0
                        }
                    }
                ]
            }
        ]
    },
    {
        "category": "Total Indirect Emissions",
        "isTotal": true,
        "emissions": {
            "tco2e": 461594.1625,
            "co2": -285.8375,
            "ch4": 0,
            "n2o": 0,
            "hfcs": 0
        }
    },
    {
        "category": "Total GHG Emissions",
        "isTotal": true,
        "emissions": {
            "tco2e": 923188.325,
            "co2": -571.675,
            "ch4": 0,
            "n2o": 0,
            "hfcs": 0
        }
    }
]

ghg_emission_2:any[]=[];
ghg_emission_3:any[]=[];


  catagury_range = "1-6"

  //page_2
  direct_emisions_paragraph="test";
  figure_4_link = "http://localhost:7080/report/figures/figure4.png"

  direct_emissions = [
    {
        "source": "generator",
        "ownership": [
            {
                "name": "Own/Hired",
                "emission": 26.1625
            },
            {
                "name": "Own",
                "emission": 0
            },
            {
                "name": "Hired",
                "emission": 0
            }
        ]
    },
    {
        "source": "freight offroad",
        "ownership": [
            {
                "name": "Own/Hired",
                "emission": 0
            },
            {
                "name": "Own",
                "emission": 0
            },
            {
                "name": "Hired",
                "emission": 0
            }
        ]
    },
    {
        "source": "refrigerant",
        "ownership": [
            {
                "name": "Own/Hired",
                "emission": 4.08
            },
            {
                "name": "Own",
                "emission": 0
            },
            {
                "name": "Hired",
                "emission": 0
            }
        ]
    },
    {
        "source": "electricity",
        "ownership": [
            {
                "name": "Own/Hired",
                "emission": 0
            },
            {
                "name": "Own",
                "emission": 462000
            },
            {
                "name": "Hired",
                "emission": 0
            }
        ]
    },
    {
        "source": "cooking gas",
        "ownership": [
            {
                "name": "Own/Hired",
                "emission": 0
            },
            {
                "name": "Own",
                "emission": 0
            },
            {
                "name": "Hired",
                "emission": 0
            }
        ]
    },
    {
        "source": "welding es",
        "ownership": [
            {
                "name": "Own/Hired",
                "emission": -432
            },
            {
                "name": "Own",
                "emission": 0
            },
            {
                "name": "Hired",
                "emission": 0
            }
        ]
    },
    {
        "source": "boiler",
        "ownership": [
            {
                "name": "Own/Hired",
                "emission": 0
            },
            {
                "name": "Own",
                "emission": 0
            },
            {
                "name": "Hired",
                "emission": 0
            }
        ]
    },


]
  direct_emissions_2 =  [
    {
        "source": "freight road",
        "ownership": [
            {
                "name": "Own/Hired",
                "emission": 0
            },
            {
                "name": "Own",
                "emission": 569657.129496
            },
            {
                "name": "Hired",
                "emission": 0.30326400000000003
            }
        ]
    },
    {
        "source": "freight rail",
        "ownership": [
            {
                "name": "Own/Hired",
                "emission": 0
            },
            {
                "name": "Own",
                "emission": 1.013472
            },
            {
                "name": "Hired",
                "emission": 0
            }
        ]
    },
    {
        "source": "freight water",
        "ownership": [
            {
                "name": "Own/Hired",
                "emission": 0
            },
            {
                "name": "Own",
                "emission": 0
            },
            {
                "name": "Hired",
                "emission": 0
            }
        ]
    },
    {
        "source": "passenger road",
        "ownership": [
            {
                "name": "Own/Hired",
                "emission": 0
            },
            {
                "name": "Own",
                "emission": 0
            },
            {
                "name": "Hired",
                "emission": 0
            }
        ]
    },
    {
        "source": "passenger rail",
        "ownership": [
            {
                "name": "Own/Hired",
                "emission": 0
            },
            {
                "name": "Own",
                "emission": 6648.866532
            },
            {
                "name": "Hired",
                "emission": 0
            }
        ]
    },
    {
        "source": "passenger offroad",
        "ownership": [
            {
                "name": "Own/Hired",
                "emission": 0
            },
            {
                "name": "Own",
                "emission": 0
            },
            {
                "name": "Hired",
                "emission": 0
            }
        ]
    },
    {
        "source": "freight air",
        "ownership": [
            {
                "name": "Own/Hired",
                "emission": 0
            },
            {
                "name": "Own",
                "emission": 0
            },
            {
                "name": "Hired",
                "emission": 0
            }
        ]
    },
    {
        "source": "waste disposal",
        "ownership": [
            {
                "name": "Own/Hired",
                "emission": 0
            },
            {
                "name": "Own",
                "emission": 0
            },
            {
                "name": "Hired",
                "emission": 0
            }
        ]
    },
    {
        "source": "passenger air",
        "ownership": [
            {
                "name": "Own/Hired",
                "emission": 0
            },
            {
                "name": "Own",
                "emission": 249.9
            },
            {
                "name": "Hired",
                "emission": 0
            }
        ]
    }
]
  direct_emissions_3 = [
    {
        "source": "gas biomass",
        "ownership": [
            {
                "name": "Own/Hired",
                "emission": 0
            },
            {
                "name": "Own",
                "emission": 0
            },
            {
                "name": "Hired",
                "emission": 0
            }
        ]
    },
  
  
    
    {
        "source": "Total",
        "emission": "1038158.158"
    }
]

  //page_3
  indirect_emisions_paragraph="test";
  indirect_emissions = [
    {
        "source": "generator",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0
            }
        ]
    },
    {
        "source": "freight offroad",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0
            }
        ]
    },
    {
        "source": "refrigerant",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0
            }
        ]
    },
    {
        "source": "electricity",
        "ownership": [
            {
                "name": "Rented",
                "emission": 27720
            }
        ]
    },
    {
        "source": "cooking gas",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0
            }
        ]
    },
    {
        "source": "welding es",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0
            }
        ]
    },
    {
        "source": "boiler",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0
            }
        ]
    },
    {
        "source": "forklifts",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0
            }
        ]
    },
    {
        "source": "fire extinguisher",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0.012
            }
        ]
    },
    {
        "source": "freight road",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0
            }
        ]
    },
    {
        "source": "freight rail",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0
            }
        ]
    },
    {
        "source": "freight water",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0
            }
        ]
    },
    {
        "source": "passenger road",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0
            }
        ]
    },
    {
        "source": "passenger rail",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0
            }
        ]
    },
    {
        "source": "passenger offroad",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0
            }
        ]
    },
    {
        "source": "freight air",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0
            }
        ]
    },
    {
        "source": "waste disposal",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0
            }
        ]
    },
    {
        "source": "passenger air",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0
            }
        ]
    },
    {
        "source": "gas biomass",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0
            }
        ]
    },
    {
        "source": "municipal water",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0
            }
        ]
    },
    {
        "source": "waste water treatment",
        "ownership": [
            {
                "name": "Rented",
                "emission": 147436.83940000003
            }
        ]
    },
    {
        "source": "offroad machinery offroad",
        "ownership": [
            {
                "name": "Rented",
                "emission": 0
            }
        ]
    },
    {
        "source": "Total",
        "emission": "0.000"
    }
]
  indirect_emissions_2 = []
  indirect_emissions_3 = []

  //page_4
  //page_4
  figure_5_link = "http://localhost:7080/report/figures/figure5.png"


  public genarateResultDirectEmissionTableParagraph(companyName: string, year: string, total_direct_emission: string, largest_direct_emission: string, largest_direct_emission_presentage: string) {

    this.direct_emisions_paragraph=`Total direct emissions of ${companyName} in the year ${year} are ${total_direct_emission}. ${largest_direct_emission} is the largest direct emission source accounting for ${largest_direct_emission_presentage} of the total direct emissions. Contribution of each emission source to the total direct emissions are presented in the Figure 4.`;

    
  }
  public genarateResultIndirectEmissionTableParagraph(companyName:string,year:string, total_indirect_emission:string,largest_indirect_emission:string,largest_indirect_emission_presentage:string){

    this.indirect_emisions_paragraph=`Total indirect emissions of the ${companyName} in the year ${year}  are ${total_indirect_emission}. ${largest_indirect_emission} is the largest indirect emission source accounting for ${largest_indirect_emission_presentage} of the total indirect emissions. Contribution of each emission source to the total indirect emissions are presented in the Figure 5.`;

    
  }

  public generateFigureLink(projectId: number, unitId: number){
    this.figure_4_link = `http://localhost:7080/report/figures/figure_u${unitId}_p${projectId}_f4.png`
    this.figure_5_link = `http://localhost:7080/report/figures/figure_u${unitId}_p${projectId}_f5.png`
  }

}

export class comparison {
  //page_1
  calculate_start = '2017';
  comparison_ghg_emission = {};
  // example
  // comparison_ghg_emission = {
  //   years: [2021, 2025],
  //   catagaries: [
  //     {
  //       catagary: 'Direct emissions',
  //       numOfRows: 11,
  //       emissions: [
  //         {
  //           name: 'electricity',
  //           ownership: [
  //             {
  //               name: 'Own',
  //               years: ['1200', '462000'],
  //             },
  //           ],
  //         },
  //         {
  //           name: 'generator',
  //           ownership: [
  //             {
  //               name: 'Hired',
  //               years: ['1382', '-'],
  //             },
  //             {
  //               name: 'Own/Hired',
  //               years: ['-', '26.1625'],
  //             },
  //           ],
  //         },
  //         {
  //           name: 'refrigerant',
  //           ownership: [
  //             {
  //               name: 'Own/Hired',
  //               years: ['-', '4.08'],
  //             },
  //           ],
  //         },
  //         {
  //           name: 'welding es',
  //           ownership: [
  //             {
  //               name: 'Own/Hired',
  //               years: ['-', '-432'],
  //             },
  //           ],
  //         },
  //         {
  //           name: 'freight road',
  //           ownership: [
  //             {
  //               name: 'Own',
  //               years: ['-', '569657.129496'],
  //             },
  //             {
  //               name: 'Hired',
  //               years: ['-', '0.30326400000000003'],
  //             },
  //           ],
  //         },
  //         {
  //           name: 'freight rail',
  //           ownership: [
  //             {
  //               name: 'Own',
  //               years: ['-', '1.013472'],
  //             },
  //           ],
  //         },
  //         {
  //           name: 'passenger rail',
  //           ownership: [
  //             {
  //               name: 'Own',
  //               years: ['-', '6648.866532'],
  //             },
  //           ],
  //         },
  //         {
  //           name: 'passenger air',
  //           ownership: [
  //             {
  //               name: 'Own',
  //               years: ['-', '249.9'],
  //             },
  //           ],
  //         },
  //         {
  //           name: 'offroad machinery offroad',
  //           ownership: [
  //             {
  //               name: 'Own',
  //               years: ['-', '2.702592'],
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //     {
  //       catagary: 'Total direct emissions',
  //       isTotal: true,
  //       numOfRows: 0,
  //       emissions: [
  //         {
  //           name: '',
  //           years: ['1382', '2.702592'],
  //         },
  //       ],
  //     },
  //     {
  //       catagary: 'Indirect emissions',
  //       numOfRows: 3,
  //       emissions: [
  //         {
  //           name: 'electricity',
  //           ownership: [
  //             {
  //               name: 'Rented',
  //               years: ['-', '27720'],
  //             },
  //           ],
  //         },
  //         {
  //           name: 'fire extinguisher',
  //           ownership: [
  //             {
  //               name: 'Rented',
  //               years: ['-', '0.012'],
  //             },
  //           ],
  //         },
  //         {
  //           name: 'waste water treatment',
  //           ownership: [
  //             {
  //               name: 'Rented',
  //               years: ['-', '147436.83940000003'],
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //     {
  //       catagary: 'Total indirect emissions',
  //       isTotal: true,
  //       numOfRows: 0,
  //       emissions: [
  //         {
  //           name: '',
  //           years: ['-', '147436.83940000003'],
  //         },
  //       ],
  //     },
  //     {
  //       catagary: 'Total GHG emissions',
  //       isTotal: true,
  //       numOfRows: 0,
  //       emissions: [
  //         {
  //           name: '',
  //           years: [1382, 147439.541992],
  //         },
  //       ],
  //     },
  //   ],
  // };

  comparison_ghg_emission_2  ;
  comparison_ghg_emission_3 ;
  //page_2

  figure_6_link = 'http://localhost:7080/report/figures/figure6.png';
  comparison_paragraph_1 = '';

  comparison_paragraph_2 = '';

  //page_3
  comparison_paragraph_3 = '';
  figure_7_link = 'http://localhost:7080/report/figures/figure7.png';
  figure_8_link = 'http://localhost:7080/report/figures/figure8.png';

  //page_4
  comparison_paragraph_4 = '';
  comparison_paragraph_5 = '';
  comparison_paragraph_6 = '';
  figure_9_link = 'http://localhost:7080/report/figures/figure9.png';
  table_8: any = {
    name: 'emission factor of grid electricity and T&D loss',
    years: ['2017', '2018', '2019', '2020'],
    emissions_factors: [
      {
        name: 'Grid electricity (kgCO2e/kWh) ',

        years: ['412.90 ', '402.83', '5.10', '4.97'],
      },
      {
        name: 'Transmission & Distribution Loss (%) ',

        years: ['412.90 ', 'NO', 'NO', '4.97'],
      },
    ],
  };

  //page_5
  figure_10_link = ' http://localhost:7080/report/figures/figure10.png';

  public genarateComparisonOrganizationalCarbonFootprintParagraph(
    yearList: string[],
    ghgemission: string[],
    inventryYear: string,
    previousYear: string,
    prsentage_inventory_and_previus: string,
    behaviour_inventory_and_previus: string,
    baseYear: string,
    prsentage_inventory_and_base,
    behaviour_inventory_and_base: string,
    total_emission_behavior: string,
    para_from_cliednt: string,
  ) {
    this.comparison_paragraph_1 = ''
    this.comparison_paragraph_1 += `Total GHG emissions for the ${yearList
      .map((a, index_a) => {
        if (yearList.length === 1) {
          return a;
        } else if (index_a == yearList.length - 1) {
          return ' and ' + a;
        } else {
          return a + ',';
        }
      })
      .join('')} are recorded 
      as ${ghgemission
        .map((a, index_a) => {
          if (yearList.length === 1) {
            return a;
          } else if (index_a == yearList.length - 1) {
            return ' and ' + a;
          } else {
            return a + ',';
          }
        })
        .join('')} tCO2e respectively.
      As illustrated in Figure 6, total GHG emissions in ${inventryYear} is `

    if (previousYear !== '') {
      this.comparison_paragraph_1 += ` ${prsentage_inventory_and_previus} ${behaviour_inventory_and_previus} that of ${previousYear} and `
    } else {
      this.comparison_paragraph_1 += `${behaviour_inventory_and_base} that of ${prsentage_inventory_and_base}% base year ${baseYear}. `
    }

    // "Main cause for the total emission ${total_emission_behavior} over the years can be the ${para_from_cliednt}" Need to add after chat is created.



  }
  public genarateComparisonDirectGhgEmissionsParagraph(
    inventory_year: string,
    largest_indirect_emission: string,
    number_of_years: number,
    followed_emissions: string[],
    presentage_inventory_previous: number,
    behavior_inventory_previous: string,
    presentage_inventory_base: number,
    behavior_inventory_base: string,
    resons: string,
  ) {

    this.comparison_paragraph_2 = ``
    this.comparison_paragraph_2 += `${largest_indirect_emission} is the largest direct emission source for `
    
    if (number_of_years === 1) {
      this.comparison_paragraph_2 += `the year, `
    } else if (number_of_years === 2) {
      this.comparison_paragraph_2 += `both years, `
    } else {
      this.comparison_paragraph_2 += `all ${number_of_years} years, `
    }
    this.comparison_paragraph_2 += `it is followed by ${followed_emissions
       .map((a, index_a) => {
         if (index_a == followed_emissions.length - 1) {
           return ' and ' + a;
         } else {
           return a + ', ';
         }
       })
       .join('')}.`
      this.comparison_paragraph_2 += `There is more than `
      if ( presentage_inventory_previous !== undefined){
        this.comparison_paragraph_2 += `${presentage_inventory_previous}% ${behavior_inventory_previous} of the total direct emissions in year ${inventory_year} compared to previous year and `
        if (presentage_inventory_base !== undefined) {
          this.comparison_paragraph_2 += `there is more than ${presentage_inventory_base}% ${behavior_inventory_base} of the total direct emissions in year ${inventory_year} compared to base year `
        }
      } else {
        this.comparison_paragraph_2 += `${presentage_inventory_base}% ${behavior_inventory_base} of the total direct emissions in year ${inventory_year} compared to base year `
      }
      this.comparison_paragraph_2 += `mainly due to the ${behavior_inventory_base} of emissions attributed to stand by ${followed_emissions
      .map((a, index_a) => {
        if (index_a == followed_emissions.length - 1) {
          return ' and ' + a;
        } else {
          return a + ', ';
        }
      })
      .join('')}.`
    //  ${resons} `; //need to add after implement chat
  }
  public genarateComparisonIndirectGhgEmissionsParagraph(
    company_name: string,
    highest_indirect_emission: string,
    presentage_inventory_previous: number,
    presentage_inventory_base: number,
    behavior_inventory_previous: string,
    behavior_inventory_base: string,
    resons: string,
  ) {
    console.log({
      company_name: company_name,
      highest_indirect_emission: highest_indirect_emission,
      presentage_inventory_previous: presentage_inventory_previous,
      presentage_inventory_base: presentage_inventory_base,
      behavior_inventory_previous: behavior_inventory_previous,
      behavior_inventory_base: behavior_inventory_base,
      resons: resons,
    })
    let baseyear = `${behavior_inventory_base} compared to base year by ${presentage_inventory_base}%.`
    let prevyear =  `${behavior_inventory_previous} compared to previous year by ${presentage_inventory_previous}%. `
    this.comparison_paragraph_3 = `Highest contributor to the indirect emissions of ${company_name} is ${highest_indirect_emission} in all years. `
    if (presentage_inventory_base !== undefined) {
      this.comparison_paragraph_3 += `Indirect emissions have ` + baseyear
      if (presentage_inventory_previous !== undefined) {
        this.comparison_paragraph_3 += ` and ` + prevyear
      }
    } else {
      if (presentage_inventory_previous !== undefined) {
        this.comparison_paragraph_3 += `Indirect emissions have ` + prevyear
      } else {
        this.comparison_paragraph_3 += ''
      }
    }
    // this.comparison_paragraph_3 += `Indirect emissions also have `
    // // this.comparison_paragraph_3 +=
    // if (presentage_inventory_base !== undefined){
    //   this.comparison_paragraph_3 += `${behavior_inventory_base} compared to base year by ${presentage_inventory_base}%.`
    // }
    // if (presentage_inventory_previous !== undefined) {
    //   this.comparison_paragraph_3 += ` and ${behavior_inventory_previous} compared to previous year by ${presentage_inventory_previous}%. `
    // }
    // this.comparison_paragraph_3 += `mostly due to ${resons} `; //need to implement after chat is implemented
  }
  public genarateComparisonEmissionFactorsParagraph(
    accordance: any[],
    table_8_emission_factors: string[],
  ) {
    const accordance_example = [{ name: '', years: [] }];
    this.comparison_paragraph_4 = `${accordance
      .map((a, index_a) => {
        if (accordance.length == 1) {
          return `
${a.name} has been used for GHG inventory of ${a.years
            .map((b, index_a) => {
              if (a.years.length==1) {
                return '' + b;
              }
             else if (index_a == a.years.length - 1) {
                return ' and ' + b +'';
              } else {
                if (index_a == a.years.length - 2){
                  return b ;
                }else{
                  return b + ',';
                }
               
              }
            })
            .join('')}`;
        }
       else if (index_a == accordance.length - 1) {
          return ` and 
${a.name} has been used for GHG inventory of ${a.years
            .map((b, index_a) => {
              if (a.years.length==1) {
                return '' + b;
              }
             else if (index_a == a.years.length - 1) {
                return ' and ' + b+'';
              } else {
                if (index_a == a.years.length - 2){
                  return b ;
                }else{
                  return b + ',';
                }
              }
            })
            .join('')}`;
        } else {
          return `${a.name} has been used for GHG inventory of ${a.years
                      .map((b, index_a) => {
                        if (a.years.length==1) {
                          return '' + b;
                        }
                       else if (index_a == a.years.length - 1) {
                          return ' and ' + b+'';
                        } else {
                          if (index_a == a.years.length - 2){
                            return b ;
                          }else{
                            return b + ',';
                          }
                        }
                      })
                      .join('')} ,` ;
        }
      })
      .join('')}. Table 8 indicates the change of emission factor of the ${table_8_emission_factors
      .map((a, index_a) => {
        if (table_8_emission_factors.length ==1) {
          return  a;
        }
        else if (index_a == table_8_emission_factors.length - 1) {
          return ' and ' + a;
        } else {
          return a + ',';
        }
      })
      .join('')}over the years. `;
  }
  public genarateComparisonperCapitaEmissionAndEmissionIntensityFigureOneParagraph(
    company_name: string,
    behavior_figure: string,
    inventory_year: string,
    behaviour_inventory_and_base: string,
    base_yaer_emission: string,
    inventory_year_emission: string,
  ) {
    this.comparison_paragraph_5 = `As per Figure 9, the per capita GHG emissions of the ${company_name} shows a ${behavior_figure}  trend over the years. It has ${behaviour_inventory_and_base}  from ${base_yaer_emission}  to ${inventory_year_emission}  tCO2e per head in year ${inventory_year}  compared to the base year.  `;
  }
  public genarateComparisonperCapitaEmissionAndEmissionIntensityFigureTwoParagraph(
    company_name: string,
    behaviour_inventory_and_base: string,
  ) {
    this.comparison_paragraph_6 = `As illustrated in the Figure 10, emission intensity of ${company_name}  has also ${behaviour_inventory_and_base} over the years indicating a sustainable growth of ${company_name} .  `;
  }

  public generateFigureLink(projectId: number, unitId: number){
    this.figure_6_link = `http://localhost:7080/report/figures/figure_u${unitId}_p${projectId}_f6.png`
    this.figure_7_link = `http://localhost:7080/report/figures/figure_u${unitId}_p${projectId}_f7.png`
    this.figure_8_link = `http://localhost:7080/report/figures/figure_u${unitId}_p${projectId}_f8.png`
    this.figure_9_link = `http://localhost:7080/report/figures/figure_u${unitId}_p${projectId}_f9.png`
    this.figure_10_link = `http://localhost:7080/report/figures/figure_u${unitId}_p${projectId}_f10.png`
  }

}

export class conclution {
  //page_1
  //page_1
  total_ghg_emission = "9,490 tCO2e"
  requirements_of = "ISO 14064-1:2018"
}

export class recomendation {
  // branch = "or branch operators"
  // calculation_especially = "company own vehicles, stand by generators, LPG, hired vehicles, employee commuting and municipal water"
  
  // recommendation_example = [
  //   {title: "test", description: " of the GHG inventory preparation process. This procedure may include task need to be carry out, responsible personal for each task, their specific rolesIt is recommended to establish a systematic procedure within ${this.companyName} to ensure completeness, accuracy, transparency, and consistency of the GHG inventory preparation process.It is recommended to establish a systematic procedure within ${this.companyName} to ensure completeness, accuracy, transparency, and consistency of the GHG inventory preparation process. This procedure may include task need to be carry out, responsible personal for each task, their specific rolesIt is recommended to establish a systematic procedure within ${this.companyName} to ensure completeness, accuracy, transparency, and consistency of the GHG inventory preparation process.It is recommended to establish a systematic procedure within ${this.companyName} to ensure completeness, accuracy, transparency, and consistency of the GHG inventory preparation process. This procedure may include task need to be carry out, responsible personal for each task, their specific roles"},
  //   {title: "test", description: "It is recommended to establish a systematic procedure within ${this.companyName} to ensure completeness, accuracy, transparency, and consistency of the GHG inventory preparation process. This procedure may include task need to be carry out, responsible personal for each task, their specific roles"}
 
  // ]
  
  recommendation = [
   
  ]
  recommendation_2 = [
 
  ]
}

export class ongoinGhgMitigation {
  mitigation = [
    {title: "test", description: "It is recommended to establish a systematic procedure within ${this.companyName} to ensure completeness, accuracy, transparency, and consistency of the GHG inventory preparation process. This procedure may include task need to be carry out, responsible personal for each task, their specific roles"},
    {title: "test", description: "It is recommended to establish a systematic procedure within ${this.companyName} to ensure completeness, accuracy, transparency, and consistency of the GHG inventory preparation process. This procedure may include task need to be carry out, responsible personal for each task, their specific roles"}
  ]
}

export class nextSteps {
  //page_1
  nestSteps = ["Establish a systematic approach to feed data monthly to SCC", "Reach carbon neutral in 2025 through following Carbon Neutral Action Plan"]

}

export class annex {
  //page_1
  annex = [{ barnch: "Pettah", city: "Gampaha(minicom) " },
  { barnch: "Kandy city office ", city: "Matara(keels super)branch " },
  { barnch: "Peliyagoda ", city: "Panadura(keel super)branch " },
  { barnch: "Ekala ", city: "Horana(wijemanna super)branch " },
  { barnch: "Kuruwita ", city: "Rajagiriya(keels super)br " }]
  annex_na = [{ barnch: "Wellawatte", city: "Union place " },
  { barnch: "Godakawela branch ", city: "Grandpass " },
  { barnch: "Palavi branch ", city: "S.L.I.C. CSP " }]
}


