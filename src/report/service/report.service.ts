import {  Catch, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { TransportMode } from 'src/emission/enum/transport.enum';
import { Parameter } from 'src/parameter/entities/parameter.entity';
import { Project } from 'src/project/entities/project.entity';
import { UnitDetails } from 'src/unit/entities/unit-details.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { getConnection, In, Repository } from 'typeorm';
import * as moment from 'moment';
import { Mitigation } from 'src/report-data/mitigation/entities/mitigation.entity';
import { Report } from '../entities/report.entity';
import { ReportHistory } from '../entities/reportHistory.entity';
import { GraphsDto } from '../dto/graphs.dto';
import { ProjectUnitEmissionSourceService } from 'src/project/service/project-unit-emission-source.service';
import { ProjectUnitService } from 'src/project/service/project-unit.service';
import { UncertaintyService } from './uncertainty.service';
import { Ownership } from 'src/project/enum/ownership.enum';
import { EsDatasource } from 'src/emission/emission-source/entities/es-datasource.entity';
import { EmissionSource } from 'src/emission/emission-source/entities/emission-source.entity';
import { EmissionCategory } from 'src/emission/emission-source/entities/emission-category.entity';
import { ProjectEmissionSource } from 'src/emission/emission-source/entities/project-emission-source.entity';
import { EsExcludeReason } from 'src/emission/emission-source/entities/es-exclude-reason.entity';
import { UnitDetailsService } from 'src/unit/unit-details.service';
import { NumEmployeesService } from 'src/unit/num-employees.service';
import { NumEmployee } from 'src/unit/entities/num-employee.entity';
import { HttpService } from '@nestjs/axios';
import { UnitService } from 'src/unit/unit.service';
import { ProjectEmissionFactorService } from 'src/project/service/project-emission-factor.service';
import { efSDto } from '../dto/efstaDto.sto';
import { PrevEmission } from 'src/unit/entities/prev-emission.entity';
import { control_approach, controlApproachDescription, equity_share, equityShareDescription, glossaryOfTerms } from '../constants/report-constants';
import { CreateReportDto, result } from '../dto/create-report.dto';
import { ParameterUnit } from 'src/utills/parameter-units';
import { ConsecutiveYears } from 'src/unit/dto/consecutive-year.dto';
import { isNull } from '@nestjsx/util';
import { AuthService } from 'src/auth/service/auth.service';

const ChartJSImage = require('chart.js-image')

const ES_URL = process.env.ES_URL || "http://localhost:7090"

@Injectable()
export class ReportService extends TypeOrmCrudService<Report>{

  public esJSON = {
    electricity: {noOfCat: 0},
    generator: {noOfCat: 1, 1: ['fuelType']},
    fire_extinguisher: {noOfCat: 1, 1: ['fireExtinguisherType']},
    refrigerant: {noOfCat: 1, 1: ['GWP_RG']},
    welding_es: {noOfCat: 1, isParas: true, 1: ['ac', 'lc']},
    forklifts: {noOfCat: 1, 1: ['fuelType']},
    boiler: {noOfCat: 2, 1: ['boilerType'], 2: ['fuelType']},
    waste_water_treatment: {noOfCat: 1, isParas: true, 1: ['wasteGenerated', 'tip', 'cod']},
    municipal_water: {noOfCat: 0},
    waste_disposal: {noOfCat: 2, 1: ['disposalMethod'], 2: ['wasteType']},
    cooking_gas: {noOfCat: 2, 1: ['emissionSource'], 2: ['gasType']},
  }

  public parameters = {
    'ac': 'Acetylene Consumption',
    'lc': 'Liquid CO2 Consumption',
    'wasteGenerated': 'Waste Generated',
    'tip': 'Total Industry Product',
    'cod': 'Chemical Oxigen Demand'
  }
  public fuelTypes: any[]
  public otherTypes: any[]

  apiConfig: any = {};
  graphData: any
  backgroundColors = [ 
    '#002060', '#ffbf00', '#4472c4', '#ed7d31', '#a5a5a5', '#ffbf00', '#5c9bd6', '#264478', '#9e490d', '#646363', '#997301', '#265f91', 
    '#44672c', '#698ed0', '#f1975a', '#b8b7b7', '#ffcd32', '#7cafdd', '#8cc067', '#335aa1', '#d26010', '#848484',
    '#cc9a00', '#347dc3', '#5a8a39',
    '#42A5F5', '#FFA726', '#2596be', '#9e480e', '#ed7d31', '#ffbf00', '#71ad47', '#997200', '#738f61', '#90a2d4',
    '#3a64ad', '#ffd184', '#e2aa01', '#d58265', '#91c6ad', '#c23531', '#304555',
  ]

  public graphSaveDirectory:string='./public/report/figures/figure';
  constructor(
    @InjectRepository(Report) repo,
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(ProjectEmissionSource) private readonly projectESRepo: Repository<ProjectEmissionSource>,
    @InjectRepository(Unit) private readonly unitRepo: Repository<Unit>,
    @InjectRepository(UnitDetails) private readonly unitDetailRepo: Repository<UnitDetails>,
    @InjectRepository(Mitigation) private readonly mitigationRepo: Repository<Mitigation>,
    @InjectRepository(ReportHistory) private readonly reportHistoryRepo: Repository<ReportHistory>,
    @InjectRepository(EsDatasource) private readonly esDataSourceRepo: Repository<EsDatasource>,
    @InjectRepository(EmissionCategory) private readonly esCategoryRepo: Repository<EmissionCategory>,
    @InjectRepository(EsExcludeReason) private readonly esExcludedRepo: Repository<EsExcludeReason>,
    @InjectRepository(NumEmployee) private readonly numEmployeeRepo: Repository<NumEmployee>,
    @InjectRepository(PrevEmission) private readonly prevEmissionsRepo: Repository<PrevEmission>,
    private readonly pesService: ProjectEmissionSourceService,
    private puesService: ProjectUnitEmissionSourceService,
    private puService: ProjectUnitService,
    private udService: UnitDetailsService,
    private empService: NumEmployeesService,
    private uncertaintyService: UncertaintyService,
    private unitService: UnitService,
    private httpService: HttpService,
    private projectEFService: ProjectEmissionFactorService,
    private parameterUnit: ParameterUnit,
    private authService: AuthService
  ) {
    super(repo);
  }

  async populateReport(unitId: number, projectId: number, types: any[], versionName: string) {
    this.otherTypes = types
    try {


      let token = await this.authService.getToken();
      this.apiConfig = {headers: {
        "Authorization": "Bearer " + token
      }}
      
      let project = await this.projectRepo.findOne({ id: projectId })
      let unit = await this.unitRepo.findOne({ id: unitId })
      let unitDetail = await this.unitDetailRepo.findOne({ unit: { id: unitId } })
      let report = await this.repo.findOne({ unit: { id: unitId }, project: { id: projectId } })

      let totalGhgEmission = this.thousandSeperate(project.directEmission + project.indirectEmission + project.otherEmission, 2) + 'tCO₂e'

      let consecutiveYearFromServer = await this.unitService.getConsecutiveYears(unitId, project.projectType.id)
      let consecYears = await this.getConsecutiveYears(consecutiveYearFromServer)
      let glossaryOfTerms = await this.getGlossaryOfTerms(project.id)

      this.fuelTypes = (await this.httpService.get(ES_URL + '/fuel/', this.apiConfig).toPromise()).data

      await this.exicutiveSummeryGraph(unit.id, project.id)
      await this.resultGraphs(unit.id, project.id)

      let emissionSources = await this.getTotal(projectId, report);
      let emissions = await this.getEmissions(emissionSources.emissions)


      const reportDto = new CreateReportDto();
      /*Basic data */
      reportDto.generateReportName = `reportPDF_` + Date.now() + `.pdf`;
      reportDto.reportName = project.name + '-report-' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
      reportDto.companyName = unit.name
      reportDto.companyLogoLink = 'http://localhost:7080' + unitDetail.logopath

      reportDto.baseYear = unitDetail.baseYear.toString()
      reportDto.inventryYear = project.year.toString()

      /* END Basic data */

      /* coverAndSecondPage */
      reportDto.coverAndSecondPage.companyBaseYear = unitDetail.baseYear.toString()
      reportDto.coverAndSecondPage.companyAdressLine1 = unitDetail.address
      reportDto.coverAndSecondPage.companyAdressLine2 = unitDetail.addressLine2
      reportDto.coverAndSecondPage.companyAdressLine3 = unitDetail.addressLine3
      reportDto.coverAndSecondPage.companyregistrationNumber = unitDetail.registrationNumber
      reportDto.coverAndSecondPage.companyEmailAdress = unitDetail.email;
      reportDto.coverAndSecondPage.companyFax = unitDetail.faxNumber;
      reportDto.coverAndSecondPage.companyTelephone = unitDetail.telephone;
      reportDto.coverAndSecondPage.version = versionName;
      
      /* END coverAndSecondPage */

      /* exicutiveSummery */
      reportDto.exicutiveSummery.generateFigureLink(project.id, unit.id)
      // reportDto.exicutiveSummery.sector = 
      let childs = await this.unitService.getChildUnits(unit.id)
      let countries = new Set(childs.map(o => {
        return this.convertToTitleCase(o.country.name)
      }))
      // reportDto.exicutiveSummery.country = unit.country.name;
      reportDto.exicutiveSummery.generateCountryList([...countries])
      reportDto.exicutiveSummery.emissionType = project.projectType.name;
      
      reportDto.exicutiveSummery.consicitiveYear = "the " +consecYears.length+ this.nth(consecYears.length) + " consecutive year";
      if (project.isFinancialYear){
        reportDto.exicutiveSummery.timePiriod = project.year.toString() + " (" + moment(project.fyFrom).format('LL') + " - " + moment(project.fyTo).format('LL') + ")"
      } else {
        reportDto.exicutiveSummery.timePiriod = project.year.toString() + " (1st January  " + project.year + ' - 31st December ' + project.year + ")";
      }
      reportDto.exicutiveSummery.accordance = report.iSOStandard + ' and ' + project.methodology.name + '.'
      // reportDto.exicutiveSummery.paragraph_1 = 
      reportDto.exicutiveSummery.emission_amount = totalGhgEmission;
      reportDto.exicutiveSummery.boundyParagrap(childs.length, unit.name)
      let numEmployee = await this.numEmployeeRepo.find({year: project.year, unitDetail: {id: unitDetail.id}})
      if (numEmployee.length > 0){
        reportDto.exicutiveSummery.capitaEmission = this.thousandSeperate((project.directEmission + project.indirectEmission + project.otherEmission)/numEmployee[0].totalEmployees, 2) + " tCO₂e"
        // reportDto.exicutiveSummery.intensityEmission = ((project.directEmission + project.indirectEmission + project.otherEmission)/numEmployee[0].totalRevenue).toExponential(2) + " tCO₂e" //removed thousand seperators
        reportDto.exicutiveSummery.intensityEmission = this.thousandSeperate(((project.directEmission + project.indirectEmission + project.otherEmission)/numEmployee[0].totalRevenue), 2)+ " tCO₂e" 
      }
      let comparison = await this.getHighestEmissions(project)
      reportDto.exicutiveSummery.highest_emission = comparison.highest;
      reportDto.exicutiveSummery.second_highest_emission = comparison.second; 
      reportDto.exicutiveSummery.third_emission = comparison.third;
      /* END exicutiveSummery */

      /* tableOfContent */
      /* END tableOfContent */

      /* listOfTableandlistOfFigures */
      /*  END listOfTableandlistOfFigures */

      /* glossaryOfTerms */
      reportDto.glossaryOfTerms.glossaryOfTermsTable = glossaryOfTerms
      /* END glossaryOfTerms */

      
      /* introduction */
      if (project.isFinancialYear){
        reportDto.introduction.reportTimePeriod = moment(project.fyFrom).format('LL') + " - " + moment(project.fyTo).format('LL') + " (the inventory year - IY " + project.year.toString(); 
      } else {
        reportDto.introduction.reportTimePeriod =  "1st January  " + project.year + ' - 31st December ' + project.year;
      }
      reportDto.introduction.policy = report.dissemination;
      reportDto.introduction.proposalNumber = report.proposalNumber;
      reportDto.introduction.proposalDate = moment(report.proposedDate).format('LL');
      reportDto.introduction.principle = "the ISO standard (" + project.methodology.name + " - " + project.methodology.description + ') '
      reportDto.introduction.introduction = unitDetail.introduction
      // reportDto.introduction.responsible = await this.getResponsiblePerson(project)
      reportDto.introduction.generateResponsiblePerson(report.responsiblePerson)
      // reportDto.introduction.policy = 
      reportDto.introduction.generateUnderbaseyear((report.attempt+this.nth(report.attempt)), report.iSOStandard)
      /* END introduction */

      /* boundries */
      reportDto.boundries.generateFigureLink(project.id, unit.id)
      if (project.organizationalBoundary === control_approach.code){
        reportDto.boundries.approach = control_approach.name
        reportDto.boundries.approach_paragraph_1 = controlApproachDescription
      } else if (project.organizationalBoundary === equity_share.code){
        reportDto.boundries.approach = equity_share.name
        reportDto.boundries.approach_paragraph_1 = equityShareDescription
      }
      reportDto.boundries.approach_paragraph_2 = ""
      reportDto.boundries.approach_paragraph_2 = report.standardAndApproach
     
      reportDto.boundries.genarateBoundiesParagraphtwo(report.lessOrGreater, report.indirectLimit)
      reportDto.boundries.direct_indirect_table = this.formatBoundaryTableData(emissions.directSources, emissions.indirectSources)
      
      /* END boundries */

      /* quantification */
      reportDto.quantification.consicitiveYear = "the " +consecYears.length+ this.nth(consecYears.length) + " consecutive year";
      // reportDto.quantification.gwp = 
      reportDto.quantification.generateParagraphOne(report.dataGatheringMethods)
      reportDto.quantification = this.formatTableLength(reportDto.quantification, emissionSources.total, 'direct_emisions')

      let efs = await this.getEmissionFactors(project.id)
      reportDto.quantification = this.formatTableLength(reportDto.quantification, efs.defra, 'defra')
      reportDto.quantification = this.formatTableLength(reportDto.quantification, efs.fuelFactor, 'fuelFactor')
      reportDto.quantification.fuelSpecific = efs.fuelSpecific
      reportDto.quantification = this.formatTableLength(reportDto.quantification, efs.common, 'common')
      reportDto.quantification.transport = efs.transport
      reportDto.quantification.gwp_table = efs.gwp
      reportDto.quantification = this.formatTableLength(reportDto.quantification, efs.freightWater, 'freightwater') 


      let uncertainties = await this.getUncertainties(report)
     
      reportDto.quantification.uncertainties_1 = uncertainties.uncertainties1;
      reportDto.quantification.uncertainties_2 = uncertainties.uncertainties2;
      reportDto.quantification.emissions = await this.getExcludedEmissionSources(report)
      /* END quantification */


      /* result */ 
      reportDto.result.generateFigureLink(project.id, unit.id)
      // reportDto.result.total_direct_emission = project.directEmission.toPrecision(2) + 'tCO₂e';
      let ghgEmissions = await this.getGHGEmissions(emissionSources.emissions, report)
      
      let formattedData = this.formatResultTableLength(ghgEmissions)
      let keys_result = ['', '_2', '_3']
      formattedData.forEach((d, idx) => {
        reportDto.result['ghg_emission' + keys_result[idx]] = d
      })
      // reportDto.result.ghg_emission = ghgEmissions
      reportDto.result.catagury_range = "1-" + ghgEmissions.length
      if (emissions.direct[1].length > 0) reportDto.result.direct_emissions = emissions.direct[1];
      if (emissions.direct[2].length > 0) reportDto.result.direct_emissions_2 = emissions.direct[2];
      if (emissions.direct[2].length > 0) reportDto.result.direct_emissions_3 = emissions.direct[3];
      if (emissions.indirect[1].length > 0) reportDto.result.indirect_emissions = emissions.indirect[1];
      if (emissions.indirect[2].length > 0) reportDto.result.indirect_emissions_2 = emissions.indirect[2];
      if (emissions.indirect[3].length > 0) reportDto.result.indirect_emissions_3 = emissions.indirect[3]; 
      reportDto.result.genarateResultDirectEmissionTableParagraph(unit.name, project.year, this.thousandSeperate(emissions.directTotal, 2) + ' tCO₂e ', this.convertToTitleCase(emissions.largestDirect),this.formatDirectIndirectPresentage(emissions.directPercentage))
      reportDto.result.genarateResultIndirectEmissionTableParagraph(unit.name, project.year, this.thousandSeperate(emissions.indirectTotal, 2) + ' tCO₂e ', this.convertToTitleCase(emissions.largestIndirect),this.formatDirectIndirectPresentage(emissions.indirectPercentage))

      
      /* END result */

      /* comparison */
      reportDto.comparison.generateFigureLink(project.id, unit.id)
      // reportDto.comparison.calculate_start = 
      let data = await this.getComparisonGHGEmissions(unit, project, unitDetail.baseYear,consecutiveYearFromServer)
      // reportDto.comparison.comparison_ghg_emission = data
      let orgData = await this.getOrganizationalComaprisonData(data, project, unitDetail)
      await this.comparisonGraphs(unit.id, project.id, 'GHG',data) 
      let formatData = this.formatCompTableLength(data)
      let keys = ['', '_2', '_3']
      formatData.forEach((d, idx) => {
        reportDto.comparison['comparison_ghg_emission' + keys[idx]] = d
      })
      // reportDto.comparison.comparison_ghg_emission = data
      reportDto.comparison.genarateComparisonOrganizationalCarbonFootprintParagraph(
        orgData.years, orgData.emissions, project.year.toString(), orgData.prevYear, orgData.inventoryPrevPercentage?.toFixed(2) + '%', orgData.inventoryPrevBehavior, unitDetail.baseYear.toString(), orgData.inventoryBasePercentage.toFixed(2), orgData.inventoryBaseBehavior, orgData.totalBehavior, '' )

      let directData = await this.getGHGComparisonData(data, project, unitDetail.baseYear, 'Direct emissions', 'DIRECT')
      reportDto.comparison.genarateComparisonDirectGhgEmissionsParagraph(
        project.year.toString(), this.convertToTitleCase(directData.largest), directData.years.length, directData.followed, directData.inventoryPrevPercentage?.toFixed(2),
        directData.inventoryPrevBehavior, directData.inventoryBasePercentage?.toFixed(2), directData.inventoryBaseBehavior, ''
      )

      let indirectData = await this.getGHGComparisonData(data, project, unitDetail.baseYear, "Indirect emissions", "INDIRECT")
      reportDto.comparison.genarateComparisonIndirectGhgEmissionsParagraph(
        unit.name, indirectData.largest, indirectData.inventoryPrevPercentage?.toFixed(2), indirectData.inventoryBasePercentage?.toFixed(2), indirectData.inventoryPrevBehavior,
        indirectData.inventoryBaseBehavior, ''
      )
      
      let perCapita = await this.getPerCapitaData(data, unitDetail)
      reportDto.comparison.genarateComparisonperCapitaEmissionAndEmissionIntensityFigureOneParagraph(
        unit.name, perCapita.behavior1, project.year.toString(), perCapita.behavior2, perCapita.firstPerCapita.toFixed(2), perCapita.lastPerCapita.toFixed(2)
      )
      reportDto.comparison.genarateComparisonperCapitaEmissionAndEmissionIntensityFigureTwoParagraph(
        unit.name,perCapita.intBehavior
      )
      let efData = await this.getElectricityEmissionFactors(unit.id, project, unitDetail.baseYear, consecutiveYearFromServer)
      reportDto.comparison.table_8 = efData

      reportDto.comparison.genarateComparisonEmissionFactorsParagraph(
         [{ name: project.methodology.name, years: [...efData.years] }], ['Grid electricity ']
      )
      /* END comparison */

      /* conclution */
      reportDto.conclution.total_ghg_emission = totalGhgEmission;
      reportDto.conclution.requirements_of = report.iSOStandard;
      /* END conclution */

      /* recomendation */
      reportDto.recomendation.recommendation = await this.createRecommendationArray(report.recommendations)
      /* END recomendation */

      /* ongoinGhgMitigation */
      reportDto.ongoinGhgMitigation.mitigation = await this.createMitigationArray(unitId, projectId);
      /* END ongoinGhgMitigation */

      /* nextSteps */
      reportDto.nextSteps.nestSteps = await this.createNextstepArray(report.nextSteps);
      /* END nextSteps */

      /* annex */
      /* END annex */

      return reportDto;
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('Getting report data failed')
    }
  }
  formatDirectIndirectPresentage(presentage:string):string{
    const directPercentage=parseFloat(presentage);
    return ( directPercentage<0.1?parseFloat(directPercentage.toFixed(2)).toLocaleString('en'):parseFloat(directPercentage.toFixed(1)).toLocaleString('en'))+'%'
 }

  formatTableLength(reportDto, data, variable){
    if (data.length > 0){
      let i = 0
      let esArr = []
      let numRows = 0
      let keys = ['', '_2', '_3', '_4', '_5']
        let key = variable + keys[i]
        data.forEach(s => {
          if (numRows === 0){
            esArr.push(s)
            numRows += s.numOfRow === 0 ? 1 : s.numOfRow
          } else {
            if (numRows < 15){
              esArr.push(s)
              numRows += s.numOfRow === 0 ? 1 : s.numOfRow
            } else {
              reportDto[key] = esArr
              esArr = []
              i++
              key = variable + keys[i]
              numRows = 0
            }
          }
        })
        if (esArr.length > 0){
          reportDto[key] = esArr
        }
    }
    return reportDto
  }

  formatResultTableLength (data) {
    let returnCats = []
   
    
    let numRows = 0
    let cats = []
    let dataObjs = []
    data.forEach(async _data => {
      let emissions = _data.emissions
      if (_data.isTotal){
        dataObjs.push(_data)
      } else {
        emissions.forEach(cat => {
          if (numRows === 0){
            numRows += cat.numOfRows
            cats.push(cat)
          } else {
            if (numRows < 20){
              numRows += cat.numOfRows
              cats.push(cat)
            } else {
              dataObjs.push({
                category: _data.category,
                isTotal: _data.isTotal,
                numOfRows: numRows,
                emissions: cats
              })
              cats = []
              numRows = 0
              numRows += cat.numOfRows
              cats.push(cat)
            }
          }
        })
        if (cats.length > 0){
          dataObjs.push({
            category: _data.category,
            isTotal: _data.isTotal,
            numOfRows: numRows,
            emissions: cats
          })
          cats = []
          numRows = 0
        }
      }
    })
    let rows = 0
    let arr = []
    dataObjs.forEach(obj => {
      if (rows === 0){
        arr.push(obj); rows += obj.numOfRows;
      } else {
        if (rows < 20){
          arr.push(obj); rows += obj.numOfRows;
        } else {
          returnCats.push(arr)
          arr = []
          rows = 0
          arr.push(obj); rows += obj.numOfRows;
        }
      }
    })
    if (arr.length > 0){
      returnCats.push(arr)
    }
    return returnCats
  }

  formatCompTableLength (data){
    let categories = data.catagaries
    let dataObjs = []

    let numRows = 0
    let cats = []
    categories.forEach(cat => {
      if (cat.isTotal){
        if (numRows < 20) { 
          numRows += 1
          cats.push(cat)
        } else {
          dataObjs.push({
            years: data.years,
            catagaries: cats
          })
          cats = []
          numRows = 0
          numRows += cat.numOfRows
          cats.push(cat)
        }
      } else {
        if (numRows === 0){
          numRows += cat.numOfRows
          cats.push(cat)
        } else {
          if (numRows < 20){
            numRows += cat.numOfRows
            cats.push(cat)
          } else {
            dataObjs.push({
              years: data.years,
              catagaries: cats
            })
            cats = []
            numRows = 0
            numRows += cat.numOfRows
            cats.push(cat)
          }
        }
      }
    })

    if (cats.length > 0){
      dataObjs.push({
        years: data.years,
        catagaries: cats
      })
    }
    return dataObjs
  }

  async saveReport(name: string, fileName:string, unitId: number, projectId: number, versionName: string){
    let report = new ReportHistory();
    report.versionName=versionName
    report.reportName = name;
    report.generateReportName = fileName;
    report.savedLocation = './public/' + fileName;
    report.thumbnail = 'https://act.campaign.gov.uk/wp-content/uploads/sites/25/2017/02/form_icon-1.jpg'
    report.unit = await this.unitRepo.findOne({ id: unitId })
    report.project = await this.projectRepo.findOne({ id: projectId })
    return await this.reportHistoryRepo.save(report)
  }

  // Get parameter wise sum

  async getTotal(projectId: number, report?: Report) {
    let dataSources: any[]
    if (report !== undefined){
      dataSources =  await this.esDataSourceRepo.find({report: {id: report.id}})
    }

    let total = []
    let emissions = []
    const res = await this.pesService.find({ project: { id: projectId } });
    await Promise.all(
      res.map(async (_source) => {
        const queryRunner = getConnection().createQueryRunner()
        let source = this.formatSourceName(_source.emissionSource.code);
        let esdataSources: any
        if (dataSources !== undefined) esdataSources = dataSources.find(o => o.emissionSource.id === _source.emissionSource.id)
        try {
          let obj = {};
          await queryRunner.connect();
          // await queryRunner.startTransaction();
          let data = queryRunner.manager.getRepository(source.class)
            .createQueryBuilder('acData')
            .innerJoin(
              'acData.project',
              'project',
              'project.id = acData.project'
            )
            .where('project.id = :id', { id: projectId });
          const res_1 = await data.getMany();

          let paraData = queryRunner.manager.getRepository(Parameter)
            .createQueryBuilder('para')
            .innerJoin(
              'para.source',
              'source',
              'source.id = para.source'
            )
            .select(['para.code', 'para.isConstant'])
            .where('source.code = :source AND para.isConstant = false', { source: _source.emissionSource.code });
          let paras = await paraData.getMany();
          
          let arr = await this.getParameterTotal(paras, res_1, _source.emissionSource, esdataSources);
          Array.prototype.push.apply(total, arr);

          let emArr = await this.categorizeEmissions(res_1, _source.emissionSource)
          emissions.push(emArr)
        } catch (err) {
          console.error(err);
          await queryRunner.rollbackTransaction();
          throw new InternalServerErrorException(err);
        } finally {
          await queryRunner.release();
        }
      })
    );
    return {
      total: total,
      emissions: emissions
    };
  }

  /**
   * Ownership is not getting in all the emission sources at data entering. Therefore, activity data cannot be categorized
   * with ownership at all the cases. 
   * For this table, direct, indirect and other column are used to get ownership, if ownership is null.
   * direct -> Own/Rented, indirect -> Hired, other -> Other, ownership == own -> Own, ownership == hired -> Hired, ownership == rented -> Rented, ownership == other -> Other
   */
  async getParameterTotal(paras: any, activityData: any, es: EmissionSource, dataSource?: any){
    let sources = {hiredSource: '', ownSource: '',  rentedSource: '', otherSource: '', directSource: ''}
    if (dataSource !== undefined){
      sources.hiredSource = dataSource.hiredDataSource
      sources.ownSource = dataSource.ownDataSource
      sources.rentedSource = dataSource.rentedDataSource
      sources.otherSource = dataSource.noneDataSource
      sources.directSource = sources.ownSource + '/' + sources.hiredSource
    }
    let es_details = this.esJSON[es.code]
    if (es_details !== undefined ){
      let arr = []
      if (!es_details.isParas){
        await paras.forEach((p: any) => {
          let tot = {dir: 0, own: 0, hired: 0, other: 0, rented: 0}
          let tot_multi = {dir: {}, own: {}, hired: {}, other: {}, rented: {}}
          let unit: any
          let noOfCat = es_details.noOfCat
          let classification = []
          let numRows = 0
          switch(noOfCat){
            case 0:
              
              activityData.forEach((_data: any) => {
                let unit_label = this.parameterUnit.parameterUnits[_data[p.code + '_unit']]
                if (_data[p.code + '_unit'] !== undefined){
                  if (!unit) unit = unit_label? unit_label.label : _data[p.code + '_unit']
                } else {
                  unit = '-'
                }
                if (_data.ownership) { //classification = 'Any'
                  if (_data.ownership === Ownership.HIRED) tot.hired = tot.hired + _data[p.code]
                  else if (_data.ownership === Ownership.OWN) tot.own = tot.own + _data[p.code]
                  else if (_data.ownership === Ownership.RENTED) tot.rented = tot.rented + _data[p.code]
                  else if (_data.ownership === Ownership.OTHER) tot.other = tot.other + _data[p.code]
                } else {
                  if (_data.direct)  tot.dir = tot.dir + _data[p.code]
                  else if (_data.indirect) tot.hired = tot.hired + _data[p.code]
                  else if (_data.other) tot.other = tot.other + _data[p.code]
                }
              })

              if (tot.dir > 0) {classification.push({name: 'Own/Rented', quantity: this.thousandSeperate(this.checkVal(tot.dir), 2), unit: unit, source: sources.directSource})}
              if (tot.rented > 0) {classification.push({name: 'Rented', quantity: this.thousandSeperate(this.checkVal(tot.rented), 2), unit: unit, source: sources.rentedSource})}
              if (tot.hired > 0) {classification.push({name: 'Hired', quantity: this.thousandSeperate(this.checkVal(tot.hired), 2), unit: unit, source: sources.hiredSource})}
              if (tot.own > 0) {classification.push({name: 'Own', quantity: this.thousandSeperate(this.checkVal(tot.own), 2), unit: unit, source: sources.ownSource})}
              if (tot.other > 0) {classification.push({name: 'Other', quantity: this.thousandSeperate(this.checkVal(tot.own), 2), unit: unit, source: sources.otherSource})}
              
              arr.push({es: this.convertToTitleCase(es.name), noOfCat: noOfCat, numOfRow: classification.length, classification: classification})
              break;
            case 1:
              let tot_1: any = {}
              let unit_1;
              let res = this.modifyCase1(es_details[1], activityData, p.code)
              tot_multi = res.tot
              let unit_label = this.parameterUnit.parameterUnits[res.unit]
              if (res.unit !== undefined){
                if (!unit_1) unit_1 = unit_label ? unit_label.label : res.unit
              } else {
                unit_1 = '-'
              }
              let cats = {dir: [], rented: [], own: [], hired: [], other: []}
              Object.keys(tot_multi.dir).forEach(key => {
                cats.dir.push({name: this.findTypeName(key),  quantity: this.thousandSeperate(this.checkVal(tot_multi.dir[key]), 2) , unit: unit_1})
              })
              Object.keys(tot_multi.rented).forEach(key => {
                cats.rented.push({name: this.findTypeName(key),  quantity: this.thousandSeperate(this.checkVal(tot_multi.rented[key]), 2) , unit: unit_1})
              })
              Object.keys(tot_multi.own).forEach(key => {
                cats.own.push({name: this.findTypeName(key),  quantity: this.thousandSeperate(this.checkVal(tot_multi.own[key]), 2) , unit: unit_1})
              })
              Object.keys(tot_multi.hired).forEach(key => {
                cats.hired.push({name: this.findTypeName(key),  quantity: this.thousandSeperate(this.checkVal(tot_multi.hired[key]), 2) , unit: unit_1})
              })
              Object.keys(tot_multi.other).forEach(key => {
                cats.other.push({name: this.findTypeName(key),  quantity: this.thousandSeperate(this.checkVal(tot_multi.hired[key]), 2) , unit: unit_1})
              })
              if (cats.dir.length > 0){classification.push({name: "Own/Rented", numOfRow: cats.dir.length,  category1: cats.dir, source: sources.directSource}); numRows += cats.dir.length}
              if (cats.rented.length > 0){classification.push({name: "Rented", numOfRow: cats.rented.length, category1: cats.rented, source: sources.rentedSource}); numRows += cats.rented.length}
              if (cats.own.length > 0){classification.push({name: "Own", numOfRow: cats.own.length, category1: cats.own, source: sources.ownSource}); numRows += cats.own.length}
              if (cats.hired.length > 0){classification.push({name: "Hired", numOfRow: cats.hired.length, category1: cats.hired, source: sources.hiredSource}); numRows += cats.hired.length}
              if (cats.other.length > 0){classification.push({name: "Other", numOfRow: cats.other.length, category1: cats.other, source: sources.otherSource}); numRows += cats.other.length}

              arr.push({ es: this.convertToTitleCase(es.name), noOfCat: noOfCat, numOfRow: numRows, classification: classification })
              break;
            case 2: 
              let res2 = this.modifyCase2(es_details, activityData, p)
              let res3 = (this.classifyCase2(res2))
              let cat = res3.cat
              if (cat.dir.length > 0){classification.push({name: "Own/Rented", numOfRow: res3.rows.dir, category1: cat.dir, source: sources.directSource}); }
              if (cat.rented.length > 0){classification.push({name: "Rented", numOfRow: res3.rows.rented, category1: cat.rented, source: sources.rentedSource}); }
              if (cat.own.length > 0){classification.push({name: "Own", numOfRow: res3.rows.own, category1: cat.own, source: sources.ownSource}); }
              if (cat.hired.length > 0){classification.push({name: "Hired", numOfRow: res3.rows.hired, category1: cat.hired, source: sources.hiredSource}); }
              if (cat.other.length > 0){classification.push({name: "Other", numOfRow: res3.rows.other, category1: cat.other, source: sources.otherSource}); }
              arr.push({ es: this.convertToTitleCase(es.name), noOfCat: noOfCat, numOfRow: res3.numRows , classification: classification })
              break;
          }
        })
      } else{
        let tot = {dir: {}, rented: {}, own: {}, hired: {}, other: {}}
        let units = {}
        es_details[1].forEach(cat => {
          activityData.forEach((_data: any) => {
            if (_data[cat + '_unit'] !== undefined){
              let unit_label = this.parameterUnit.parameterUnits[_data[cat + '_unit']]
              units[cat] = unit_label ? unit_label.label :  _data[cat + '_unit']
            } else {
              units[cat] = '-'
            }
            if (_data.ownership){
              if (_data.ownership === Ownership.OWN){
                modify('own', cat, _data[cat])
              } else if (_data.ownership === Ownership.HIRED){
                modify('hired', cat, _data[cat])
              } else if (_data.ownership === Ownership.RENTED){
                modify('rented', cat, _data[cat])
              } else if (_data.ownership === Ownership.OTHER){
                modify('other', cat, _data[cat])
              } 

            } else {
              if (_data.direct){
                modify('dir', cat, _data[cat])
              } else if (_data.indirect){
                modify('hired', cat, _data[cat])
              } else if (_data.other){
                modify('other', cat, _data[cat])
              }
            }
            
          })
        })
        function modify(type, cat, data){
          if (Object.keys(tot[type]).includes(cat)){
            tot[type][cat] =  tot[type][cat] +  data
          } else {
            tot[type][cat] = data
          }
        }
        let cats = {dir: [], rented: [], own: [], hired: [], other: []}
        let cat1=[]
        let classification = []
        let numRows = 0
        Object.keys(tot.dir).forEach(key => {
          cats.dir.push({name:  this.parameters[key],  quantity: this.thousandSeperate(this.checkVal(tot.dir[key]), 2) , unit: units[key]})
        })
        Object.keys(tot.rented).forEach(key => {
          cats.rented.push({name:  this.parameters[key],  quantity: this.thousandSeperate(this.checkVal(tot.rented[key]), 2) , unit: units[key]})
        })
        Object.keys(tot.own).forEach(key => {
          cats.own.push({name:  this.parameters[key],  quantity: this.thousandSeperate(this.checkVal(tot.own[key]), 2) , unit: units[key]})
        })
        Object.keys(tot.hired).forEach(key => {
          cats.hired.push({name:  this.parameters[key],  quantity: this.thousandSeperate(this.checkVal(tot.hired[key]), 2) , unit: units[key]})
        })
        Object.keys(tot.other).forEach(key => {
          cats.other.push({name:  this.parameters[key],  quantity: this.thousandSeperate(this.checkVal(tot.hired[key]), 2) , unit: units[key]})
        })
        if (cats.dir.length > 0){classification.push({name: "Own/Rented",numOfRow: cats.dir.length, category1: cats.dir, source: sources.directSource}); numRows += cats.dir.length}
        if (cats.rented.length > 0){classification.push({name: "Rented", numOfRow: cats.rented.length, category1: cats.rented, source: sources.rentedSource}); numRows += cats.rented.length}
        if (cats.own.length > 0){classification.push({name: "Own", numOfRow: cats.own.length, category1: cats.own, source: sources.ownSource}); numRows += cats.own.length}
        if (cats.hired.length > 0){classification.push({name: "Hired", numOfRow: cats.hired.length, category1: cats.hired, source: sources.hiredSource}); numRows += cats.hired.length}
        if (cats.other.length > 0){classification.push({name: "Other", numOfRow: cats.other.length, category1: cats.other, source: sources.otherSource}); numRows += cats.other.length}
        arr.push({ es: this.convertToTitleCase(es.name), noOfCat: es_details.noOfCat, numOfRow: numRows, classification: classification })
      }
      return arr
    } else {
      let freight = [sourceName.freight_air, sourceName.freight_offroad, sourceName.freight_rail, sourceName.freight_road, sourceName.freight_water, sourceName.offroad_machinery]
      let passenger = [sourceName.passenger_air, sourceName.passenger_offroad, sourceName.passenger_rail, sourceName.passenger_road]
      
      if (freight.includes(es.code as sourceName)){
        return this.getFreightTotal(activityData, es, sources)
      } else if (passenger.includes(es.code as sourceName)){
        return this.getPassengerTotal(activityData, es, sources)
      }
    }
  }

  modifyCase1(categories, activityData, code){
    let unit_1
    let tot_multi = {dir: {}, own: {}, hired: {}, rented: {}, other: {}}
    categories.forEach(cat => {
      activityData.forEach((_data: any) => {
        if (!unit_1) unit_1 = _data[code + '_unit']
        if (_data.ownership){ //classification = 'Any'
          if (_data.ownership === Ownership.HIRED){
            modify('hired', _data[cat], _data[code])
          } else if (_data.ownership === Ownership.RENTED){
            modify('rented', _data[cat], _data[code])
          } else if (_data.ownership === Ownership.OWN){
            modify('own', _data[cat], _data[code])
          } else if (_data.ownership === Ownership.OTHER){
            modify('other', _data[cat], _data[code])
          }
        } else {
          if (_data.direct){
            modify('dir', _data[cat], _data[code])
          } else if (_data.indirect) {
            modify('hired', _data[cat], _data[code])
          } else if (_data.other) {
            modify('other', _data[cat], _data[code])
          }
        }
      })
      function modify(type, cat, data){
        if (Object.keys(tot_multi[type]).includes(cat)){
          tot_multi[type][cat] = tot_multi[type][cat] + data
        } else {
          tot_multi[type][cat] = data
        }
      }
    })

    return {
      unit: unit_1,
      tot: tot_multi
    }
  }

  modifyCase2(categories, activityData, para) {
    let tot = {dir: {}, rented: {}, own: {}, hired: {}, other: {}}
    let unit
    categories[1].forEach(cat1 => {
      categories[2].forEach(cat2 => {
        activityData.forEach((_data: any) => {
          if (!unit && _data[para.code + '_unit'] !== undefined) {
            let unit_label = this.parameterUnit.parameterUnits[_data[para.code + '_unit']]
            unit = unit_label ? unit_label.label : _data[para.code + '_unit']
          } else {
            unit = '-'
          }

          if (_data.ownership){
            if (_data.ownership === Ownership.OWN){
              modify('own', _data[cat1], _data[cat2], _data[para.code])
            } else if (_data.ownership === Ownership.HIRED){
              modify('hired', _data[cat1], _data[cat2], _data[para.code])
            } else if (_data.ownership === Ownership.RENTED){
              modify('rented', _data[cat1], _data[cat2], _data[para.code])
            } else if ( _data.ownerShip === Ownership.OTHER){
              modify('other', _data[cat1], _data[cat2], _data[para.code])
            }
          } else {
            if (_data.direct){
              modify('dir', _data[cat1], _data[cat2], _data[para.code])
            } else if (_data.indirect){
              modify('hired', _data[cat1], _data[cat2], _data[para.code])
            } else if (_data.other){
              modify('other', _data[cat1], _data[cat2], _data[para.code])
            }
          }
        })
        function modify(type, cat1, cat2, data){
          if (!Object.keys(tot[type]).includes(cat1)) {
            tot[type][cat1] = {}
          }
          if (Object.keys(tot[type][cat1]).includes(cat2)) {
            tot[type][cat1][cat2] = tot[type][cat1][cat2] + data 
          } else {
            tot[type][cat1][cat2] = data
          }
        }
      })
    })

    return {
      tot: tot,
      unit: unit
    }
  }

  classifyCase2(res){
    let tot = res.tot
    let cats = {dir: [], rented: [], own: [], hired: [], other: []}
    let rows = {dir: 0, rented: 0, own: 0, hired: 0, other: 0}
    let numOfRow = 0

    Object.keys(tot.dir).forEach(key_1 => {
      let cat2 = []
      Object.keys(tot.dir[key_1]).forEach(key_2 => {
        cat2.push({ name: this.findTypeName(key_2), quantity: this.thousandSeperate(this.checkVal(tot.dir[key_1][key_2]), 2), unit: res.unit })
      })
      rows.dir += cat2.length
      numOfRow += cat2.length
      cats.dir.push({name: this.findTypeName(key_1), cat2Length: cat2.length, category2: cat2})
    })

    Object.keys(tot.rented).forEach(key_1 => {
      let cat2 = []
      Object.keys(tot.rented[key_1]).forEach(key_2 => {
        cat2.push({name: this.findTypeName(key_2), quantity: this.thousandSeperate(this.checkVal(tot.rented[key_1][key_2]), 2), unit: res.unit})
      })
      rows.rented += cat2.length
      numOfRow += cat2.length
      cats.rented.push({name: this.findTypeName(key_1), cat2Length: cat2.length, category2: cat2})
    })

    Object.keys(tot.own).forEach(key_1 => {
      let cat2 = []
      Object.keys(tot.own[key_1]).forEach(key_2 => {
        cat2.push({name: this.findTypeName(key_2), quantity: this.thousandSeperate(this.checkVal(tot.own[key_1][key_2]), 2), unit: res.unit})
      })
      rows.own += cat2.length
      numOfRow += cat2.length
      cats.own.push({name: this.findTypeName(key_1), cat2Length: cat2.length, category2: cat2})
    })

    Object.keys(tot.hired).forEach(key_1 => {
      let cat2 = []
      Object.keys(tot.hired[key_1]).forEach(key_2 => {
        cat2.push({name: this.findTypeName(key_2), quantity: this.thousandSeperate(this.checkVal(tot.hired[key_1][key_2]), 2), unit: res.unit})
      })
      rows.hired += cat2.length
      numOfRow += cat2.length
      cats.hired.push({name: this.findTypeName(key_1), cat2Length: cat2.length, category2: cat2})
    })

    Object.keys(tot.other).forEach(key_1 => {
      let cat2 = []
      Object.keys(tot.other[key_1]).forEach(key_2 => {
        cat2.push({name: this.findTypeName(key_2), quantity: this.thousandSeperate(this.checkVal(tot.other[key_1][key_2]), 2), unit: res.unit})
      })
      rows.other += cat2.length
      numOfRow += cat2.length
      cats.other.push({name: this.findTypeName(key_1), cat2Length: cat2.length, category2: cat2})
    })

    return {
      cat: cats,
      rows: rows,
      numRows: numOfRow
    }
  }

  getFreightTotal(activityData: any, es: EmissionSource, sources: any){
    let arr = []
    let tot_fuel: any = {dir: {}, rented: {}, own: {}, hired: {}, other: {}}
    let tot_distance: any = {dir: {}, rented: {}, own: {}, hired: {}, other: {}}
    let fuel_unit: any
    let classification = []
    let numRows = 0

    const getData = (type, _data) => {
      if (_data.method === TransportMode.fuel_base) {
        if (_data['fuelConsumption_unit'] !== undefined){
          let unit_label = this.parameterUnit.parameterUnits[_data['fuelConsumption_unit']]
          fuel_unit =  unit_label ? unit_label.label : _data['fuelConsumption_unit']
        } else {
          fuel_unit = '-'
        }
        getFuel(type, _data)
      } else if (_data.method === TransportMode.distance_base) {
        getDistance(type, _data)
      }
    }

    activityData.forEach((_data: any) => {
      if (_data.ownership){
        if (_data.ownership === Ownership.OWN){
          getData('own', _data)
        } else if (_data.ownership === Ownership.HIRED){
          getData('hired', _data)
        } else if (_data.ownership === Ownership.RENTED){
          getData('rented', _data)
        } else if (_data.ownership === Ownership.OTHER){
          getData('other', _data)
        }
      } else {
        if (_data.direct){
          getData('dir', _data)
        } else if (_data.indirect){
          getData('hired', _data)
        } else if (_data.other){
          getData('other', _data)
        }
      }
    })

    function getFuel(type, _data){
      if (Object.keys(tot_fuel[type]).includes(_data.fuelType)) {
        tot_fuel[type][_data.fuelType] = tot_fuel[type][_data.fuelType] + _data['fuelConsumption']
      } else {
        tot_fuel[type][_data.fuelType] = _data['fuelConsumption']
      }
    }

    function getDistance(type, _data){
      let distance = 0
      let weight = 0
      let cost = 0
      if (_data['totalDistanceTravelled']) distance += _data['totalDistanceTravelled']
      if (_data['upDistance']) distance += _data['upDistance']
      if (_data['downDistance']) distance += _data['downDistance']

      if (_data['weight']) weight += _data['weight']
      if (_data['upWeight']) weight += _data['upWeight']
      if (_data['downWeight']) weight += _data['downWeight']

      if (_data['cost']) cost += _data['cost']
      if (_data['upCost']) cost += _data['upCost']
      if (_data['downCost']) cost += _data['downCost']

      if (Object.keys(tot_distance[type]).includes('distance')){
        tot_distance[type]['distance'] += distance
      } else {
        tot_distance[type]['distance'] = distance
      }

      if (Object.keys(tot_distance[type]).includes('weight')){
        tot_distance[type]['weight'] += weight
      } else {
        tot_distance[type]['weight'] = weight
      }

      if (Object.keys(tot_distance[type]).includes('cost')){
        tot_distance[type]['cost'] +=  cost
      } else {
        tot_distance[type]['cost'] +=  cost
      }
    }
    
    let cat = {dir: [], rented: [], own: [], hired: [], other: []}
    let categories = ['dir', 'rented', 'own', 'hired', 'other']

    categories.forEach(_key => {
      Object.keys(tot_fuel[_key]).forEach(key => {
        cat[_key].push({name: this.findTypeName(key),  quantity: this.thousandSeperate(this.checkVal(tot_fuel[_key][key]), 2) , unit: fuel_unit})
      })
    })

    categories.forEach(key => {
      if (tot_distance[key]['distance'] !== undefined) cat[key].push({name: 'Distance', quantity: this.thousandSeperate(this.checkVal(tot_distance[key]['distance']), 2), unit: 'km'})
      if (tot_distance[key]['weight'] !== undefined) cat[key].push({name: 'Weight',  quantity: this.thousandSeperate(this.checkVal(tot_distance[key]['weight']), 2), unit: 't'})
      if (tot_distance[key]['cost'] !== undefined) cat[key].push({name: 'Cost', quantity: this.thousandSeperate(this.checkVal(tot_distance[key]['cost']), 2), unit: 'LKR'})
    })

    if (cat.dir.length > 0){classification.push({name: "Own/Rented", numOfRow: cat.dir.length,  category1: cat.dir, source: sources.directSource}); numRows += cat.dir.length}
    if (cat.rented.length > 0){classification.push({name: "Rented", numOfRow: cat.rented.length, category1: cat.rented, source: sources.rentedSource}); numRows += cat.rented.length}
    if (cat.own.length > 0){classification.push({name: "Own", numOfRow: cat.own.length, category1: cat.own, source: sources.ownSource}); numRows += cat.own.length}
    if (cat.hired.length > 0){classification.push({name: "Hired", numOfRow: cat.hired.length, category1: cat.hired, source: sources.hiredSource}); numRows += cat.hired.length}
    if (cat.other.length > 0){classification.push({name: "Other", numOfRow: cat.other.length, category1: cat.other, source: sources.otherSource}); numRows += cat.other.length}

    arr.push({ es: this.convertToTitleCase(es.name), noOfCat: 1, numOfRow:numRows, classification: classification })
   
    return arr
  }

  getPassengerTotal(activityData: any, es: EmissionSource, sources: any){
    let arr = []
    let categories = ['dir', 'rented', 'own', 'hired', 'other']
    let tot_fuel: any = {dir: {}, rented: {}, own: {}, hired: {}, other: {}}
    let tot_distance: any = {dir: {}, rented: {}, own: {}, hired: {}, other: {}}
    let tot_bt: any = {dir: {}, rented: {}, own: {}, hired: {}, other: {}}
    let tot_ec: any = {dir: {}, rented: {}, own: {}, hired: {}, other: {}}
    let fuel_unit: any
    let classification = []
    let numRows = 0

    const getData = (es, type, _data) => {
      if (es as sourceName !== sourceName.passenger_road) {
        if (_data.method === TransportMode.fuel_base){
          if (_data['fuelConsumption_unit'] !== undefined){
            let unit_label = this.parameterUnit.parameterUnits[_data['fuelConsumption_unit']]
            fuel_unit = unit_label ? unit_label.label : _data['fuelConsumption_unit']
          } else {
            fuel_unit = '-'
          }
          if (Object.keys(tot_fuel[type]).includes(_data.fuelType)) {
            tot_fuel[type][_data.fuelType] = tot_fuel[type][_data.fuelType] + _data['fuelConsumption']
          } else {
            tot_fuel[type][_data.fuelType] = _data['fuelConsumption']
          }
        } else if (_data.method === TransportMode.distance_base){
          let distance = 0
          let cost = 0
          if (_data['totalDistanceTravelled']) distance += _data['totalDistanceTravelled']
          if (_data['upDistance']) distance += _data['upDistance']
          if (_data['downDistance']) distance += _data['downDistance']
  
          if (_data['cost']) cost += _data['cost']
          if (_data['upCost']) cost += _data['upCost']
          if (_data['downCost']) cost += _data['downCost']
  
          if (Object.keys(tot_distance[type]).includes('distance')){
            tot_distance[type]['distance'] += distance
          } else {
            tot_distance[type]['distance'] = distance
          }
  
          if (Object.keys(tot_distance[type]).includes('cost')){
            tot_distance[type]['cost'] +=  cost
          } else {
            tot_distance[type]['cost'] +=  cost
          }
        }
      } else {
        if (_data.transportMethod === 'BT'){
          if (_data.method === TransportMode.fuel_base){
            let unit_label = this.parameterUnit.parameterUnits
            if (_data['btFuelConsumption_unit'] !== undefined){
              fuel_unit = unit_label ? unit_label[_data['btFuelConsumption_unit']].label : _data['btFuelConsumption_unit']
            }else {
              fuel_unit = '-'
            }
            if (Object.keys(tot_bt[type]).includes(_data.fuelType)) {
              tot_bt[type][_data.fuelType] = tot_bt[type][_data.fuelType] + _data['btFuelConsumption']
            } else {
              tot_bt[_data.fuelType] = _data['btFuelConsumption']
            }
          } else if (_data.method === TransportMode.distance_base){
            if (Object.keys(tot_bt[type]).includes(_data.fuelType)) {
              tot_bt[type][_data.fuelType] = tot_bt[type][_data.fuelType] + _data['totalDistanceTravelled']
            } else {
              tot_bt[_data.fuelType] = _data['totalDistanceTravelled']
            }
          }
        } else if (_data.transportMethod === 'EC'){
          if (_data.method === TransportMode.fuel_base){
            if (Object.keys(tot_bt[type]).includes('Petrol')) {
              tot_ec[type]['Petrol'] = tot_ec[type]['Petrol'] + _data['petrolConsumption']
            } else {
              tot_ec[type]['Petrol'] = _data['petrolConsumption']
            }
            if (Object.keys(tot_bt[type]).includes('Diesel')) {
              tot_ec[type]['Diesel'] = tot_ec[type]['Diesel'] + _data['dieselConsumption']
            } else {
              tot_ec[type]['Diesel'] = _data['dieselConsumption']
            }
          } else if (_data.method === TransportMode.distance_base){
            if (Object.keys(tot_bt[type]).includes(_data.fuelType)) {
              tot_ec[type][_data.fuelType] = tot_ec[type][_data.fuelType] + _data['privateDistance']
            } else {
              tot_ec[type][_data.fuelType] = _data['privateDistance']
            }
            if (Object.keys(tot_bt[type]).includes(_data.fuelType)) {
              tot_ec[type][_data.fuelType] = tot_ec[type][_data.fuelType] + _data['publicDistance']
            } else {
              tot_ec[type][_data.fuelType] = _data['publicDistance']
            }
          }
        }
      }
    }

    activityData.forEach((_data: any) => {
      if (_data.ownership){
        if (_data.ownership === Ownership.OWN){
          getData(es,'own', _data)
        } else if (_data.ownership === Ownership.HIRED){
          getData(es, 'hired', _data)
        } else if (_data.ownership === Ownership.RENTED){
          getData(es, 'rented', _data)
        } else if (_data.ownership === Ownership.OTHER){
          getData(es, 'other', _data)
        }
      } else {
        if (_data.direct){
          getData(es, 'dir', _data)
        } else if (_data.indirect){
          getData(es, 'hired', _data)
        } else if (_data.other){
          getData(es, 'other', _data)
        }
      }
    })

    

    if (es.code as sourceName !== sourceName.passenger_road){
      let cat = {dir: [], rented: [], own: [], hired: [], other: []}
      categories.forEach(_key => {
        Object.keys(tot_fuel[_key]).forEach(key => {
          cat[_key].push({name: this.findTypeName(key),  quantity: this.thousandSeperate(this.checkVal(tot_fuel[_key][key] ), 2), unit: fuel_unit})
        })
      })

      categories.forEach(key => {
        if (tot_distance[key]['distance'] !== undefined) cat[key].push({name: 'Distance', quantity: this.thousandSeperate(this.checkVal(tot_distance[key]['distance']), 2), unit: 'km'})
        if (tot_distance[key]['cost'] !== undefined) cat[key].push({name: 'Cost', quantity: this.thousandSeperate(this.checkVal(tot_distance[key]['cost']), 2), unit: 'LKR'})
      })

      if (cat.dir.length > 0) { classification.push({ name: "Own/Rented", numOfRow: cat.dir.length, category1: cat.dir, source: sources.directSource }); numRows += cat.dir.length }
      if (cat.rented.length > 0) { classification.push({ name: "Rented", numOfRow: cat.rented.length, category1: cat.rented, source: sources.rentedSource }); numRows += cat.rented.length }
      if (cat.own.length > 0) { classification.push({ name: "Own", numOfRow: cat.own.length, category1: cat.own, source: sources.ownSource }); numRows += cat.own.length }
      if (cat.hired.length > 0) { classification.push({ name: "Hired", numOfRow: cat.hired.length, category1: cat.hired, source: sources.hiredSource }); numRows += cat.hired.length }
      if (cat.other.length > 0){classification.push({name: "Other", numOfRow: cat.other.length, category1: cat.other, source: sources.otherSource}); numRows += cat.other.length}

      arr.push({ es: this.convertToTitleCase(es.name), noOfCat: 1, numOfRow: numRows, classification: classification })
    } else {
      let cat_ = {dir: [], rented: [], own: [], hired: [], other: []}
      let cat__ = {dir: [], rented: [], own: [], hired: [], other: []}
      let cat = {dir: [], rented: [], own: [], hired: [], other: []}

      categories.forEach(key_ => {
        Object.keys(tot_bt[key_]).forEach(key => {
          cat_[key_].push({name: this.findTypeName(key),  quantity: this.thousandSeperate(this.checkVal(tot_bt[key_][key]), 2), unit:  fuel_unit})
        })
      })

      categories.forEach(key_ => {
        Object.keys(tot_ec[key_]).forEach(key => {
          cat__[key_].push({name: this.findTypeName(key),  quantity: this.thousandSeperate(this.checkVal(tot_ec[key_][key]), 2), unit:  fuel_unit})
        })
      })
      
      let rows = {dir: 0, rented: 0, own: 0, hired: 0, other: 0}
      categories.forEach(key_ => {
        if (cat_[key_].length > 0){ cat[key_].push({name: 'Business Travel', cat2Length: cat_[key_].length, category2: cat_[key_]}); numRows += cat_[key_].length;}
        if (cat__[key_].length > 0){ cat[key_].push({name: 'Employee Commuting', cat2Length: cat__[key_].length, category2: cat__[key_]}); numRows += cat__[key_].length;}
        rows[key_] = cat_[key_].length + cat__[key_].length
      })

      if (cat.dir.length > 0) { classification.push({ name: "Own/Rented", numOfRow: rows['dir'], category1: cat.dir, source: sources.directSource });}
      if (cat.rented.length > 0) { classification.push({ name: "Rented", numOfRow: rows['rented'], category1: cat.rented, source: sources.rentedSource });  }
      if (cat.own.length > 0) { classification.push({ name: "Own", numOfRow: rows['own'], category1: cat.own, source: sources.ownSource });  }
      if (cat.hired.length > 0) { classification.push({ name: "Hired", numOfRow: rows['hired'], category1: cat.hired, source: sources.hiredSource }); }
      if (cat.other.length > 0){classification.push({name: "Other", numOfRow: rows['other'], category1: cat.other, source: sources.otherSource}); }

      arr.push({ es: this.convertToTitleCase(es.name), noOfCat: 2, numOfRow: numRows, classification: classification })
    }

   
    return arr
  }

  formatSourceName (s: string){
    let _class = (s.split("_").join(" ") 
                    .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()) 
                    .replace(/\s/g, '')) + 'ActivityData'
                   
    let _entity = s + '_activity_data'                
    return {
      class: _class, entity: _entity
    }
  }

  findTypeName(key) {
    if (this.fuelTypes){
      let fuel = this.fuelTypes.find(o => o.code === key)
      if (fuel !== undefined){
        return fuel.name
      } else {
        if (this.otherTypes){
          let other = this.otherTypes.find(o => o.code === key)
          if (other !== undefined){
            return other.name
          } else {
            return key
          }
        } else {
          return key
        }
      }
    } else {
      return key
    }
  }

  async getEmissions(data: any[]){
    let directEmissions = {1: [], 2: [], 3: []}
    let directTotal = 0
    let directMax = 0
    let largestdirectEs = ''
    let indirectEmissions = {1: [], 2: [], 3: []}
    let indirectTotal = 0
    let indirectMax = 0
    let largestIndirectEs = ''
    let d_i = 1; let d_count = 0
    let i_i = 1; let i_count = 0
    let dirctSources = []
    let indirectSources = []
    data.forEach(_data => {
      let dirownership = []
      let indrownership = []
      if ( _data.direct.esc !== 0 ||_data.own.esc !== 0 || _data.rented.esc !== 0 ){
        dirownership.push(...[
          { name: 'Own/Rented', emission: this.thousandSeperate(_data.direct.esc, 2) },
          { name: 'Own', emission: this.thousandSeperate(_data.own.esc, 2) },
          { name: 'Rented', emission: this.thousandSeperate(_data.rented.esc, 2)},
        ])
        d_count += dirownership.length
  
        directEmissions[d_i].push({source: this.convertToTitleCase(_data.es.name), ownership: dirownership})
  
        directTotal += _data.direct.esc + _data.own.esc + _data.rented.esc
        dirctSources.push(_data.es.name)
      }
      if (_data.hired.esc !== 0){
        indrownership.push({name: 'Hired', emission: this.thousandSeperate(_data.hired.esc, 2)})
        i_count += indrownership.length
        indirectEmissions[i_i].push({source: this.convertToTitleCase(_data.es.name), ownership: indrownership})

        indirectTotal += _data.hired.esc

        indirectSources.push(_data.es.name)
      }

      if (directMax < _data.direct.esc + _data.own.esc + _data.rented.esc){
        directMax = _data.direct.esc + _data.own.esc + _data.rented.esc
        largestdirectEs = _data.es.name
      }

      if (indirectMax < _data.hired.esc){
        indirectMax = _data.hired.esc
        largestIndirectEs = _data.es.name
        // indirectTotal += _data.indirect
      }

      if (d_count > 20) { d_count = 0; d_i = d_i + 1}
      if (i_count > 20) { i_count = 0; i_i = i_i + 1}

    })
    directEmissions[d_i].push({source: 'Total', emission: this.thousandSeperate(directTotal, 2)})
    indirectEmissions[i_i].push({source: 'Total', emission: this.thousandSeperate(indirectTotal, 2)})

    return {
      direct: directEmissions,
      indirect: indirectEmissions,
      largestDirect: largestdirectEs,
      largestIndirect: largestIndirectEs,
      directTotal: directTotal,
      indirectTotal: indirectTotal,
      directPercentage: ((directMax / directTotal) * 100).toFixed(3),
      indirectPercentage: ((indirectMax / indirectTotal) * 100).toFixed(3),
      directSources: dirctSources,
      indirectSources: indirectSources
    }
  }

  async getGHGEmissions(data: any[], report: Report){

    let categories = await this.esCategoryRepo.find()
    let modifedCategories = []
    
    let directTot = { tco2e: 0, co2: 0, ch4: 0, n2o: 0, hfcs: 0 }
    let indirectTot = { tco2e: 0, co2: 0, ch4: 0, n2o: 0, hfcs: 0 }
    for await (const cat of categories) {
      let sources = []
      let numRows = 0
      for await (const _data of data){
        let ownership = []
        let esDataSource = await this.esDataSourceRepo.findOne({ report: { id: report.id }, emissionSource: { id: _data.es.id } })
        if (esDataSource && (esDataSource.hiredCategory || esDataSource.rentedCategory || esDataSource.ownCategory || esDataSource.noneCategory)) {
          let hasDirect = !ownership.some(o => o.name === 'Own/Rented') && cat.code === 'CAT_1'
          if (cat.code === esDataSource.ownCategory?.code) { 
            if (hasDirect){
              ownership.push(...[
                { name: "Own/Rented", 
                emission: { 
                  tco2e: this.thousandSeperate(_data.direct.esc, 2), 
                  co2: this.thousandSeperate(_data.direct.eco2, 2) , 
                  ch4: this.thousandSeperate(_data.direct.ech4, 2) , 
                  n2o: this.thousandSeperate(_data.direct.en2o, 2) , 
                  hfcs: this.thousandSeperate(_data.direct.ehfc, 2)  } },
              ])
            }
            ownership.push(...[
              { name: "Own", 
                emission: { 
                  tco2e: this.thousandSeperate(_data.own.esc, 2), 
                  co2: this.thousandSeperate(_data.own.eco2, 2), 
                  ch4: this.thousandSeperate(_data.own.ech4, 2), 
                  n2o: this.thousandSeperate(_data.own.en2o, 2), 
                  hfcs: this.thousandSeperate(_data.own.ehfc, 2)   } }
            ])
            if (cat.code === 'CAT_1'){
              directTot.tco2e += (hasDirect ? _data.direct.esc : 0) + _data.own.esc
              directTot.co2 += (hasDirect ? _data.direct.eco2 : 0) + _data.own.eco2 
              directTot.ch4 += (hasDirect ? _data.direct.ech4 : 0)  + _data.own.ech4
              directTot.n2o += (hasDirect ? _data.direct.en2o : 0) + _data.own.en2o 
              directTot.hfcs += (hasDirect ? _data.direct.ehfc : 0)  + _data.own.ehfc
            } else {
              indirectTot.tco2e += _data.own.esc 
              indirectTot.co2 += _data.own.eco2
              indirectTot.ch4 += _data.own.ech4 
              indirectTot.n2o += _data.own.en2o
              indirectTot.hfcs += _data.own.ehfc 
            }
          }
          if (cat.code === esDataSource.rentedCategory?.code ) { 
            hasDirect = !ownership.some(o => o.name === 'Own/Rented') && cat.code === 'CAT_1'
            if (hasDirect){
              ownership.push(...[
                { name: "Own/Rented", 
                emission: { 
                  tco2e: this.thousandSeperate(_data.direct.esc, 2), 
                  co2: this.thousandSeperate(_data.direct.eco2, 2) , 
                  ch4: this.thousandSeperate(_data.direct.ech4, 2) , 
                  n2o: this.thousandSeperate(_data.direct.en2o, 2) , 
                  hfcs: this.thousandSeperate(_data.direct.ehfc, 2)  } },
              ])
            }
            ownership.push(...[
              { name: "Rented", 
                emission: { 
                  tco2e: this.thousandSeperate(_data.rented.esc, 2) , 
                  co2: this.thousandSeperate(_data.rented.eco2, 2) , 
                  ch4: this.thousandSeperate(_data.rented.ech4, 2) , 
                  n2o: this.thousandSeperate(_data.rented.en2o, 2) , 
                  hfcs: this.thousandSeperate(_data.rented.ehfc, 2)  } }
            ])
            if (cat.code === 'CAT_1'){
              directTot.tco2e += (hasDirect ? _data.direct.esc : 0) + _data.rented.esc
              directTot.co2 += (hasDirect ? _data.direct.eco2 : 0) + _data.rented.eco2
              directTot.ch4 += (hasDirect ? _data.direct.ech4 : 0) + _data.rented.ech4
              directTot.n2o += (hasDirect ? _data.direct.en2o : 0) + _data.rented.en2o
              directTot.hfcs += (hasDirect ? _data.direct.ehfc : 0) + _data.rented.ehfc
            } else {
              indirectTot.tco2e += _data.rented.esc 
              indirectTot.co2 += _data.rented.eco2
              indirectTot.ch4 += _data.rented.ech4 
              indirectTot.n2o += _data.rented.en2o
              indirectTot.hfcs += _data.rented.ehfc 
            }
          }
          if (cat.code === esDataSource.hiredCategory?.code) {
            ownership.push({
              name: "Hired",
              emission: {
                tco2e: this.thousandSeperate(_data.hired.esc, 2),
                co2: this.thousandSeperate(_data.hired.eco2, 2),
                ch4: this.thousandSeperate(_data.hired.ech4, 2),
                n2o: this.thousandSeperate(_data.hired.en2o, 2),
                hfcs: this.thousandSeperate(_data.hired.ehfc, 2)
              }
            })
            if (cat.code === 'CAT_1'){
              directTot.tco2e += _data.hired.esc
              directTot.co2 += _data.hired.eco2
              directTot.ch4 += _data.hired.ech4
              directTot.n2o += _data.hired.en2o
              directTot.hfcs += _data.hired.ehfc 
            } else {
              indirectTot.tco2e += _data.hired.esc
              indirectTot.co2 += _data.hired.eco2
              indirectTot.ch4 += _data.hired.ech4
              indirectTot.n2o += _data.hired.en2o
              indirectTot.hfcs += _data.hired.ehfc 
            }
          }
          if (cat.code === esDataSource.noneCategory?.code) {
            ownership.push({
              name: "Other",
              emission: {
                tco2e: this.thousandSeperate(_data.other.esc, 2),
                co2: this.thousandSeperate(_data.other.eco2, 2),
                ch4: this.thousandSeperate(_data.other.ech4, 2),
                n2o: this.thousandSeperate(_data.other.en2o, 2),
                hfcs: this.thousandSeperate(_data.other.ehfc, 2)
              }
            })
            if (cat.code === 'CAT_1'){
              directTot.tco2e += _data.other.esc
              directTot.co2 += _data.other.eco2
              directTot.ch4 += _data.other.ech4
              directTot.n2o += _data.other.en2o
              directTot.hfcs += _data.other.ehfc 
            } else {
              indirectTot.tco2e += _data.other.esc
              indirectTot.co2 += _data.other.eco2
              indirectTot.ch4 += _data.other.ech4
              indirectTot.n2o += _data.other.en2o
              indirectTot.hfcs += _data.other.ehfc 
            }
          }

          if (ownership.length > 0){
            sources.push({ name: this.convertToTitleCase(_data.es.name) , numOfRows: ownership.length, ownership: ownership })
          }
        }
        numRows += ownership.length
      }

      let emissions: any = this.getObjSum({...directTot}, {...indirectTot})

      modifedCategories.push({
        category: cat.name,
        isTotal: false,
        numOfRows: numRows,
        emissions: sources
      })

      if (cat.code === 'CAT_1'){
        modifedCategories.push({
          category: 'Total Direct Emissions',
          isTotal: true,
          numOfRows: 0,
          emissions: directTot
        })
      }
      if (cat.code === 'CAT_6'){
        modifedCategories.push({
          category: 'Total Indirect Emissions',
          isTotal: true,
          numOfRows: 0,
          emissions: indirectTot
        })
        modifedCategories.push({
          category: 'Total GHG Emissions',
          isTotal: true,
          numOfRows: 0,
          emissions: emissions
        })
      }
    }

    modifedCategories = modifedCategories.map(o => {
      if (o.category.includes('Total')){
        o.emissions.tco2e = this.thousandSeperate(o.emissions.tco2e, 2)
        o.emissions.co2 = this.thousandSeperate(o.emissions.co2, 2)
        o.emissions.ch4 = this.thousandSeperate(o.emissions.ch4, 2)
        o.emissions.n2o = this.thousandSeperate(o.emissions.n2o, 2)
        o.emissions.hfcs = this.thousandSeperate(o.emissions.hfcs, 2)
      }
      return o
    })


    return modifedCategories

  }

  getObjSum(obj1, obj2){
    let obj = {}
    Object.keys(obj1).forEach(function(a){
      obj[a] = obj1[a] +obj2[a]  
    })
    return obj
  }

  async getUncertainties(report: Report) {
    let uncertainties = await this.uncertaintyService.find({report: {id: report.id}});
    // let uncertainties = await this.uncertaintyService.find({relations:['report'],where:{report: {id: report.id}}});
    console.log('uncertainties',uncertainties)
    let uncertainties_ = uncertainties.map(obj => {
      return {
        title : this.convertToTitleCase(obj.emissionSource.name),
        description: obj.descryption
      }
    })
    let uncertainties1 = [];
    for(let i =0;i<4;i++){
      if(uncertainties_.length>i){
        uncertainties1.push(uncertainties_[i])
      }
    }
    let uncertainties2 = [];
    for(let i =4;i<4;i++){
      if(uncertainties_.length>i){
        uncertainties2.push(uncertainties_[i])
      }
    }

    return ({
      uncertainties1: uncertainties1,
      uncertainties2: uncertainties2
    })
  }

  async getHighestEmissions(project){
    let pes = await this.projectESRepo.find({project: {id: project.id}})
    let total = 0
    pes = pes.map(es => {
      let tot = es.directEmission + es.indirectEmission + es.otherEmission
      es['totalEmission'] = tot
      total += tot
      return es
    })

    pes.sort((a, b) => (a['totalEmission'] < b['totalEmission']) ? 1 : -1)

    let highest = pes[0].emissionSource.name + ' (' +  this.thousandSeperate(pes[0]['totalEmission'], 2) + ' tCO₂e, ' + ((pes[0]['totalEmission']/total)*100).toFixed(2) + '%)'
    let second = pes[1].emissionSource.name + ' (' +  this.thousandSeperate(pes[1]['totalEmission'], 2) + ' tCO₂e, ' + ((pes[1]['totalEmission']/total)*100).toFixed(2) + '%)'
    let third = pes[2].emissionSource.name + ' (' +  this.thousandSeperate(pes[2]['totalEmission'], 2) + ' tCO₂e, ' + ((pes[2]['totalEmission']/total)*100).toFixed(2) + '%)'

   return {
    highest: highest,
    second: second,
    third: third
   }

  }

  async categorizeEmissions(activityData: any[], es: EmissionSource){
    let directEmission = {esc: 0 , eco2: 0, ech4: 0, en2o: 0, ehfc: 0}
    let rentedEmission = {esc: 0 , eco2: 0, ech4: 0, en2o: 0, ehfc: 0}
    let otherEmission = {esc: 0 , eco2: 0, ech4: 0, en2o: 0, ehfc: 0}
    let ownEmission = {esc: 0 , eco2: 0, ech4: 0, en2o: 0, ehfc: 0}
    let hiredEmission = {esc: 0 , eco2: 0, ech4: 0, en2o: 0, ehfc: 0}

    activityData.forEach(_data => {
      if (_data.ownership && _data.ownership !== "undefined"){
        if (_data.ownership === Ownership.OWN){
          ownEmission.esc += this.checkValRes(_data.e_sc)
          ownEmission.eco2 += this.checkValRes(_data.e_sc_co2) 
          ownEmission.ech4 += this.checkValRes(_data.e_sc_ch4) 
          ownEmission.en2o += this.checkValRes(_data.e_sc_n2o) 
        } else if (_data.ownership === Ownership.HIRED){
          hiredEmission.esc += this.checkValRes(_data.e_sc) 
          hiredEmission.eco2 += this.checkValRes( _data.e_sc_co2)
          hiredEmission.ech4 += this.checkValRes(_data.e_sc_ch4) 
          hiredEmission.en2o += this.checkValRes(_data.e_sc_n2o) 
        } else if (_data.ownership === Ownership.RENTED){
          rentedEmission.esc += this.checkValRes(_data.e_sc) 
          rentedEmission.eco2 += this.checkValRes(_data.e_sc_co2)
          rentedEmission.ech4 += this.checkValRes(_data.e_sc_ch4) 
          rentedEmission.en2o += this.checkValRes(_data.e_sc_n2o) 
        } else if (_data.ownership === Ownership.OTHER){
          otherEmission.esc += this.checkValRes(_data.e_sc) 
          otherEmission.eco2 += this.checkValRes(_data.e_sc_co2) 
          otherEmission.ech4 += this.checkValRes(_data.e_sc_ch4) 
          otherEmission.en2o += this.checkValRes(_data.e_sc_n2o) 
        }
      } else {
        if (_data.direct){
          directEmission.esc += this.checkValRes(_data.e_sc)
          directEmission.eco2 += this.checkValRes(_data.e_sc_co2) 
          directEmission.ech4 += this.checkValRes(_data.e_sc_ch4) 
          directEmission.en2o += this.checkValRes(_data.e_sc_n2o) 
        } else if (_data.indirect){
          hiredEmission.esc += this.checkValRes(_data.e_sc) 
          hiredEmission.eco2 += this.checkValRes(_data.e_sc_co2) 
          hiredEmission.ech4 += this.checkValRes(_data.e_sc_ch4)
          hiredEmission.en2o += this.checkValRes(_data.e_sc_n2o) 
        } else if (_data.other) {
          otherEmission.esc += this.checkValRes(_data.e_sc) 
          otherEmission.eco2 += this.checkValRes(_data.e_sc_co2) 
          otherEmission.ech4 += this.checkValRes(_data.e_sc_ch4) 
          otherEmission.en2o += this.checkValRes(_data.e_sc_n2o) 
        }
      }
    })

    return {
      es: es,
      direct: directEmission,
      rented: rentedEmission,
      other: otherEmission,
      own: ownEmission,
      hired: hiredEmission
    }
  }

  async getExcludedEmissionSources(report: Report){
    let ex = await this.esExcludedRepo.find({report: {id: report.id}})
    return ex.map(es => {
      return {emission_source: this.convertToTitleCase(es.emissionSource.name), resons: es.reason}
    })
  }

  async getConsecutiveYears(csYear: ConsecutiveYears){
    let years = []
    csYear.years.forEach(y => years.push(y.year))
    return {
      years: years,
      length: csYear.years.length
    }
  }

  async getResponsiblePerson(project){
    let data = this.projectRepo.createQueryBuilder('project')
    .leftJoinAndSelect(
      'project.responsiblePerson',
      'user',
      'user.id = project.responsiblePersonId'
    )
    .where ('project.id = :id', {id: project.id})

    let p = await data.getOne()

    return p.responsiblePerson.firstName + ' ' + p.responsiblePerson.lastName
  }

  async getElectricityEmissionFactors(unitId: number, project: Project, baseYear: number, consecutiveYearFromServer: ConsecutiveYears) {
    let codes = []
    let years = []
    let EF = {}

    let data = this.projectRepo.createQueryBuilder('project')
    .leftJoinAndSelect(
      'project.ownerUnit',
      'unit',
      'unit.id = project.ownerUnitId'
    ).leftJoinAndSelect(
      'unit.country',
      'country',
      'country.id = unit.countryId'
    )
    .where ('project.id = :id', {id: project.id})

    let p = await data.getOne()

    codes.push('EF_GE')
    let ConsecutiveYear = consecutiveYearFromServer;

    let _years = ConsecutiveYear.years.map((obj) => obj.year);
    let Consecutiveyears = []
    _years.map(y => {
      if (!Consecutiveyears.includes(parseInt(y+''))){
        Consecutiveyears.push(y)
      }
    })
    Consecutiveyears.sort()
    if (Consecutiveyears.length > 4){
      Consecutiveyears = Consecutiveyears.slice(-4)
    }
    if (!Consecutiveyears.includes(baseYear)){
      Consecutiveyears.push(baseYear)
    }
    Consecutiveyears.sort()

    EF["name"] = "Grid electricity (kgCO2e/kWh) "

    let factors = []
    for (let i = 0; i < Consecutiveyears.length; i++) {

      const url = `${ES_URL}/common-emission-factor/get-common-ef`
      let data = {
        "year": Consecutiveyears[i],
        "countryCode": p.ownerUnit.country.code, //"LK",
        "codes": codes
      }
      let factor = (await this.httpService.post(url, data, this.apiConfig).toPromise()).data
      factor = factor.map((obj) => obj.value);

      factors.push(this.thousandSeperate(this.checkVal(factor[0]), 6))
    }

    EF['years'] = factors

    var efJson = {
      name: "emission factor of grid electricity and T&D loss",
      years: Consecutiveyears,
      emissions_factors: [EF]
    }
    return efJson;
  }

  async getEmissionFactors(projectId: number){
    let es = await this.projectESRepo.find({project: {id: projectId}})
    let esCodes = es.map(e => {return e.emissionSource.code})
    let emArry = await this.projectEFService.getEmissionFactors(esCodes, projectId)
    let defra = []
    let transport = []
    let fuelFactor = []
    let common = []
    let fuelSpecific = []
    let freightWater = []

    for await (const efs of emArry){
      let ef = new efSDto();
      ef.es = efs.es
      ef.noOfCat = 1;
      
      if (efs.data.length > 0){
        let _defra = this.projectEFService.assignsubdefra(efs.data, 'defra')
        let _ff = this.projectEFService.assignsubfuel(efs.data, 'fuelFactor', this.fuelTypes)
        let _fs = this.projectEFService.assignsubfuelsp(efs.data, 'fuelSpecific', this.fuelTypes)
        let _common = this.projectEFService.assignsub(efs.data, 'common')
        let _transport = this.projectEFService.assignsubtrans(efs.data, 'transport')
        let _fw = this.projectEFService.assignsubfw(efs.data, 'freightWater', this.otherTypes)

         _common.category = _common.category.filter((value, index) => {
          const _value = JSON.stringify(value);
          return index === _common.category.findIndex(obj => {
            return JSON.stringify(obj) === _value;
          });
        });

        if (_defra.category.length > 0) defra.push({es: this.convertToTitleCase(efs.es), noOfCat: 1, numOfRow: _defra.numOfRows, category1: _defra.category})
        if (_ff.category.length > 0) fuelFactor.push({es: this.convertToTitleCase(efs.es), noOfCat: 1, numOfRow: _ff.numOfRows, category1: _ff.category})
        if (_transport.category.length > 0) transport.push({es: this.convertToTitleCase(efs.es), noOfCat: 1, numOfRow: _transport.numOfRows, category1: _transport.category})
        if (_common.category.length > 0) common.push({es:this.convertToTitleCase(efs.es), noOfCat: 1, numOfRow: _common.category.length, category1: _common.category})
        if (_fs.category.length > 0) fuelSpecific.push({es: this.convertToTitleCase(efs.es), noOfCat: 1, numOfRow: _fs.numOfRows, category1: _fs.category})
        if (_fw.category.length > 0) freightWater.push({es: this.convertToTitleCase(efs.es), noOfCat: 1, numOfRow: _fw.numOfRows, category1: _fw.category})

      }
    }

    let gwp = await this.projectEFService.getGWPValues(projectId)

    return {
      defra: defra,
      transport: transport,
      fuelFactor: fuelFactor,
      common: common,
      fuelSpecific: fuelSpecific,
      freightWater: freightWater,
      gwp: gwp
    }


  
  }

  async exicutiveSummeryGraph( unitId: number, projectId: number): Promise<any> {
    let childs = await this.unitService.getChildUnits(unitId)
    let unitIds = childs.map(u => {return u.id})
    unitIds.push(unitId)
    if(unitIds.length>0){

    }
    /*Data for Graph 1*/
    let graphEmissions =await this.puesService.ExicutiveSummaryGraphFac1(unitIds, projectId );

   /*Data for Graph 2*/
    let graphEmissions2 =await this.puesService.ExicutiveSummaryGraphFac2(unitIds, projectId);

   /*Data seperate for Graph 1*/
    let emissionType = ["direct","indirect","Other"]
    const directEmission = graphEmissions.map((obj) => obj.directEmission);
    const indirectEmission = graphEmissions.map((obj) => obj.indirectEmission);
    const otherEmission = graphEmissions.map((obj) => obj.otherEmission);
    let totalGhgEmission = [...directEmission,...indirectEmission,...otherEmission];
    
    const ghg_emission_bar_chart = ChartJSImage()
      .chart({
        type: 'bar',
        data: {
          labels: emissionType,
          datasets: [
            {
              backgroundColor: [
                '#002060', "#ffbf00", "#2596be"
              ],

              barThickness: 2,
              maxBarThickness: 4,
              minBarLength: 1,
              data: totalGhgEmission

            },

          ],
        },
        options: {
          responsive: true,
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Project Emmisions(tCO₂)',
          },
          scales: {
            xAxes: [
              {
                barPercentage: 0.3,
                stacked: true,
                scaleLabel: {
                  display: true,
                  labelString: '',
                },
                gridLines: {
                  offsetGridLines: true
                }
              },
            ],
            yAxes: [
              {
                stacked: true,
                scaleLabel: {
                  display: true,
                  labelString: 'GHG Emissions (tCO₂e)',
                },

              },
            ],
          },
          datalabels: {
            display: true,
            align: 'bottom',
            backgroundColor: '#ccc',
            borderRadius: 3,
            font: {
              size: 18,
            },
          },
        },
      }) // bar chart
      .backgroundColor('white')
      .width(500) // 500px
      .height(300); // 300px

    /**Get data for graph 2 */

    this.graphData = await this.pesService.etEmissionsTotals(projectId)
    let emissions = []
    let directtotal = []
    let indirecttotal = []
    let othertotal = []
    for (let emission of this.graphData) {
      emissions.push(this.convertToTitleCase(emission.emissionSourseName))
      directtotal.push(emission.directEmission ? emission.directEmission : 0)
      indirecttotal.push(emission.indirectEmission ? emission.indirectEmission : 0)
      othertotal.push(emission.otherEmission ? emission.otherEmission : 0)
    }

    /**------------ */
    /**------------ */

    /**------------ */ 

    let estdata = {
      labels: emissions,
      datasets: [
        {
          label: 'Direct',
          backgroundColor: '#002060',
          data: directtotal
        },
        {
          label: 'Indirect',
          backgroundColor: '#ffbf00',
          data: indirecttotal
        },
        {
          label: 'Other',
          backgroundColor: '#2596be',
          data: othertotal
        }
      ]
    };

    const ghg_emission_source_bar_chart = ChartJSImage()
      .chart({
        type: 'horizontalBar',
        data: estdata,
        options: {
          legend: {
            display: true,
            labels: {
              boxHeight: 10,
              fontSize: 8
              // font: {
              //   size: 8
              // }
            }
          },
          title: {
            display: true,
            text: 'Project Emmisions(tCO₂)',
          },
          scales: {
            xAxes: [
              {

                stacked: false,
                scaleLabel: {
                  display: true,
                  labelString: 'GHG Emissions (tCO₂e)',

                },
                gridLines: {
                  offsetGridLines: true
                },
                ticks: {
                  fontSize: 8,
                  beginAtZero: true
                }
              },
            ],
            yAxes: [
              {
                barPercentage: 0.3,
                stacked: true,
                scaleLabel: {
                  display: true,
                  labelString: 'Emission Source',
                },
                ticks: {
                  fontSize: 8,

                }

              },
            ],
          },

        },
      }) // bar chart
      .backgroundColor('white')
      .width(600) // 500px
      // .height(500); 

    return await ghg_emission_bar_chart.toFile(this.graphSaveDirectory + '_u' + unitId + '_p' + projectId + '_f1.png'),
      await ghg_emission_source_bar_chart.toFile(this.graphSaveDirectory +  '_u' + unitId + '_p' + projectId +'_f2.png'); // Promise<()>


  }
  
  async resultGraphs( unitId: number, projectId: number): Promise<string> {
    let childs = await this.unitService.getChildUnits(unitId)
    let unitIds = childs.map(u => {return u.id})
    unitIds.push(unitId)

    let graphEmissions =await this.puesService.ResultGraphFac(unitIds, projectId );

    const directData = graphEmissions.filter((obj) => obj.clasification === 'Direct' || obj.clasification === 'DIRECT AND INDIRECT');

    const indirectData = graphEmissions.filter((obj) => obj.clasification === 'Indirect' || obj.clasification === 'DIRECT AND INDIRECT');

    // const directSource = directData.map((obj) => obj.emissionSource_name);

    // const directEmission = directData.map((obj) => obj.graph_directEmission);

    // const indirectSource = indirectData.map((obj) => obj.emissionSource_name);

    // const indirectEmission = indirectData.map((obj) => obj.graph_indirectEmission);

    let directSource = []
    let indirectSource = []
    let directEmission = []
    let indirectEmission = []
    let othertotal = []
    let directBackgroundColor = []
    let indirectBackgroundColor = []
    for (let emission of this.graphData) {
      // emissions.push(this.convertToTitleCase(emission.emissionSourseName))
      directSource.push(this.convertToTitleCase(emission.emissionSourseName))
      indirectSource.push(this.convertToTitleCase(emission.emissionSourseName))
      directEmission.push(emission.directEmission ? emission.directEmission : 0)
      indirectEmission.push(emission.indirectEmission ? emission.indirectEmission : 0)
      othertotal.push(emission.otherEmission ? emission.otherEmission : 0)
    }

    for (let i = 0; i < directSource.length; i++) {
      directBackgroundColor.push(this.backgroundColors[i])
    }
    for (let i = 0; i < indirectSource.length; i++) {
      indirectBackgroundColor.push(this.backgroundColors[i])
    }

    const direct_emission_pie_chart = ChartJSImage()
      .chart({
        type: 'pie',
        data: {
          labels: directSource,
          datasets: [{
            data: directEmission,
            backgroundColor: directBackgroundColor
          }]
        },
        options: {
          legend: {
            display: true,
            position: 'right',
          },
          title: {
            display: true,
            text: 'Direct Emissions'
          }
        }
      }) // pie chart
      .backgroundColor('white')
      .width(800) // 800px
      .height(400); // 400px


    const indirect_emission_pie_chart = ChartJSImage()
      .chart({
        type: 'pie',
        data: {
          labels: indirectSource,
          datasets: [{
            data: indirectEmission,
            backgroundColor: indirectBackgroundColor
          }]
        },
        options: {
          legend: {
            display: true,
            position: 'right',
          },
          title: {
            display: true,
            text: 'Indirect Emissions'
          }
        }
      }) // pie chart
      .backgroundColor('white')
     .width(800) // 800px
     .height(400); // 400px






    return await direct_emission_pie_chart.toFile(this.graphSaveDirectory + '_u' + unitId + '_p' + projectId +'_f4.png'),
      await indirect_emission_pie_chart.toFile(this.graphSaveDirectory + '_u' + unitId + '_p' + projectId +'_f5.png'); // Promise<()>




  }

  async comparisonGraphs(unitId: number, projectId: number, projectType: string, data: any){

    let years = data.years
    let directTotalEmissions = (data.catagaries.filter((obj) => {
      return obj.totalCat === 'DIRECT'
    }))[0]
    let directEmissions = (data.catagaries.filter((obj) => {
      return obj.catagary === 'Direct emissions'
    }))[0]

    let indirectTotalEmissions = (data.catagaries.filter((obj) => {
      return obj.totalCat === 'INDIRECT'
    }))[0]
    let indirectEmissions = (data.catagaries.filter((obj) => {
      return obj.catagary === 'Indirect emissions'
    }))[0]

    let totalEmissions = (data.catagaries.filter((obj) => {
      return obj.totalCat === 'SUBTOTAL'
    }))[0]

    /** Comparison of overall emissions over the years */
    let directTotals = directTotalEmissions.emissions[0].years.map((e: string) => parseFloat(e.replace(/,/g, '')))
    let indirectTotals = indirectTotalEmissions.emissions[0].years.map((e: string) => parseFloat(e.replace(/,/g, '')))
    const ghg_comparison_emission_bar_chart = ChartJSImage()
    .chart({
      type: 'bar',
      data: {
        labels: years,
        datasets: [
          {
            backgroundColor: '#002060',
            label: 'Direct',
            barThickness: 2,
            maxBarThickness: 4,
            minBarLength: 1,
            data: directTotals,
            stack: 'Stack 0',
          },
          {
            backgroundColor: "#ffbf00",
            label: 'Indirect',
            barThickness: 2,
            maxBarThickness: 4,
            minBarLength: 1,
            data: indirectTotals,
            stack: 'Stack 0',
          },


        ],
      },
      options: {

        responsive: true,
        interaction: {
          intersect: false,
        },
        legend: {
          display: true,
          position: 'bottom',
        },
        title: {
          display: true,
          text: '',
        },
        scales: {
          xAxes: [
            {
              barPercentage: 0.3,
              stacked: true,
              scaleLabel: {
                display: true,
                labelString: 'Years',
              },
              gridLines: {
                offsetGridLines: true
              },

            },
          ],
          yAxes: [
            {
              stacked: true,
              scaleLabel: {
                display: true,
                labelString: 'GHG Emissions (tCO₂e)',
              },
              ticks: {
                fontSize: 12,
                beginAtZero: true
              }

            },
          ],
        },
      },
    }) // bar chart
    .backgroundColor('white')
    .width(500) // 500px
    .height(300); // 300px
    /**Comparison of overall emissions over the years - END */

    let dioptions = {
      responsive: true,
      legend: {
        display: true,
        position: 'bottom',
      },
      title: {
        display: true,
        text: '',
      },
      scales: {
        xAxes: [
          {
            barPercentage: 0.3,

            scaleLabel: {
              display: true,
              labelString: 'Emission Sources',
            },
            gridLines: {
              offsetGridLines: true
            },
            ticks: {
              fontSize: 8,

            }
          },
        ],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'GHG Emissions (tCO₂e)',
            },
            ticks: {
              fontSize: 12,
              beginAtZero: true
            }
          },
        ],
      },
    }

    let directLables = directEmissions.emissions.map(em => {
      return em.name
    })
    let indirectLables = indirectEmissions.emissions.map(em => {
      return em.name
    })

    let lables = [...new Set([...directLables, ...indirectLables])]

    /** Comparison of direct emissions over the years */
    let dirDataSets = []
    years.forEach((y, idx) => {
      let esData = []
      lables.forEach(l => {
        let em = (directEmissions.emissions.filter(o => o.name === l))[0]
        let emission = 0
        if (em){
          em.ownership.forEach(ow => {
            emission += ow.years[idx] !== '-' ? parseFloat(ow.years[idx].replace(/,/g, '')) : 0
          })
        }
        esData.push(emission)
      })
      dirDataSets.push({
        backgroundColor: this.backgroundColors[idx],
        label: y,
        barThickness: 3,
        maxBarThickness: 4,
        minBarLength: 1,
        data: esData,

      })
    })


    const ghg_comparison_direct_emission_bar_chart = ChartJSImage()
    .chart({
      type: 'bar',
      data: {
        labels: lables,
        datasets: dirDataSets,
      },
      options: dioptions
    }) // bar chart
    .backgroundColor('white')
    .width(500) // 500px
    // .height(300); // 300px

    /** Comparison of direct emissions over the years - END */

    /**Comparison of Indirect emissions over the years */
    let indirDataSets = []
    years.forEach((y, idx) => {
      let esData = []
      lables.forEach(l => {
        let em = (indirectEmissions.emissions.filter(o => o.name === l))[0]
        let emission = 0
        if (em){
          em.ownership.forEach(ow => {
            emission += ow.years[idx] !== '-' ? parseFloat(ow.years[idx].replace(/,/g, '')) : 0
          })
        }
        esData.push(emission)
      })
      indirDataSets.push({
        backgroundColor: this.backgroundColors[idx],
        label: y,
        barThickness: 3,
        maxBarThickness: 4,
        minBarLength: 1,
        data: esData,
      })
    })


    const ghg_comparison_indirect_emission_bar_chart = ChartJSImage()
      .chart({
        type: 'bar',
        data: {
          labels: lables,
          datasets: indirDataSets,
        },
        options: dioptions
      }) // bar chart
      .backgroundColor('white')
      .width(500) // 500px
      // .height(300); // 300px

       /**Comparison of Indirect emissions over the years - END*/

       let perCapitaEmission = [];
       let intensityEmission = [];

       let totalEmission = totalEmissions.emissions[0].years

       let unitDetail = await this.unitDetailRepo.find({unit: {id: unitId}})


       if (unitDetail){
        let numEmployee = await this.numEmployeeRepo.find({unitDetail: {id: unitDetail[0].id}})
        years.forEach((y, idx) => {
          if (numEmployee){
            let emp = numEmployee.filter(em => em.year === y.toString())
            if(emp.length !== 0){
              let total = parseFloat(totalEmission[idx].replace(/,/g, ''))
              console.log(total/emp[0].totalEmployees, total,emp[0].totalEmployees)
              console.log(total / (parseFloat(emp[0].totalRevenue + '')/Math.pow(10,6)), total,emp[0].totalRevenue)
              perCapitaEmission.push(total / emp[0].totalEmployees)
              intensityEmission.push(total / (parseFloat(emp[0].totalRevenue + '')/Math.pow(10,6)))
            } else {
              perCapitaEmission.push(0)
              intensityEmission.push(0)
            }
          }else {
            perCapitaEmission.push(0)
            intensityEmission.push(0)
          }
        })
       } else {
        perCapitaEmission.push(...Array(years.length).fill(0))
        intensityEmission.push(...Array(years.length).fill(0))
       }
       /** Comparison of per capita emission over the years */

   
       
       const perCapita_emission_chart = ChartJSImage()
       .chart({
         type: 'line',
         data: {
           labels: years,
           datasets: [
             {
               // label: '',
               borderColor: 'rgb(54,+162,+235)',
               backgroundColor: 'rgba(54,+162,+235,+.5)',
               data: perCapitaEmission,
             },
           ],
         },
         options: {
           title: {
             display: true,
             text: '',
           },
           legend: {
             display: false,
 
           },
           scales: {
             xAxes: [
               {
                 scaleLabel: {
                   display: true,
                   labelString: 'Year',
                 },
               },
             ],
             yAxes: [
               {
                 stacked: true,
                 scaleLabel: {
                   display: true,
                   labelString: 'Percapita emission (tCO₂e/employee)',
                 },
               },
             ],
           },
         },
       }) // Line chart
       .backgroundColor('white')
       .width(500) // 500px
       .height(300); // 300px
       /** Comparison of per capita emission over the years - END*/

       /** Comparison of emission intensity over the years*/
       const intensity_emission_chart = ChartJSImage()
       .chart({
         type: 'line',
         data: {
           labels: years,
           datasets: [
             {
               // label: '',
               borderColor: 'rgb(54,+162,+235)',
               backgroundColor: 'rgba(54,+162,+235,+.5)',
               data: intensityEmission,
             },
           ],
         },
         options: {
           title: {
             display: true,
             text: '',
           },
           legend: {
             display: false,
 
           },
           scales: {
             xAxes: [
               {
                 scaleLabel: {
                   display: true,
                   labelString: 'Year',
                 },
               },
             ],
             yAxes: [
               {
                 stacked: true,
                 scaleLabel: {
                   display: true,
                   labelString: 'Emission Intensity(tCO₂e/Rs. Millions)',
                 },
               },
             ],
           },
         },
       }) // Line chart
       .backgroundColor('white')
       .width(500) // 500px
       .height(300); // 300px
       /** Comparison of emission intensity over the years - END*/

      return await ghg_comparison_emission_bar_chart.toFile(this.graphSaveDirectory + '_u' + unitId + '_p' + projectId + '_f6.png'),
      await ghg_comparison_direct_emission_bar_chart.toFile(this.graphSaveDirectory + '_u' + unitId + '_p' + projectId + '_f7.png'),
      await ghg_comparison_indirect_emission_bar_chart.toFile(this.graphSaveDirectory + '_u' + unitId + '_p' + projectId + '_f8.png'),
      await perCapita_emission_chart.toFile(this.graphSaveDirectory + '_u' + unitId + '_p' + projectId + '_f9.png'),
      await intensity_emission_chart.toFile(this.graphSaveDirectory + '_u' + unitId + '_p' + projectId + '_f10.png')
  }

  async createMitigationArray(unitId: number, projectId: number) {
    let childs = await this.unitService.getChildUnits(unitId)
    let unitIds = childs.map(u => {return u.id})
    unitIds.push(unitId)
    let mitigations = await this.mitigationRepo.find({ unit: { id: In(unitIds) }, project: { id: projectId } })
    return mitigations.map(m => {
      return { title: m.title, description: m.descryption }
    })
  }

  async createNextstepArray(steps){
    return steps.map((s: any) => { return s.descryption })
  }

  async createRecommendationArray(recommendations){
    return recommendations.map((rec: any) => {
      return {title: rec.title, description: rec.descryption}
    })
  }

  async getComparisonGHGEmissions(unit: Unit, project: Project, baseYear: number, consecutiveYearFromServer: ConsecutiveYears){
    let childs = await this.unitService.getChildUnits(unit.id)
    let unitIds = childs.map(u => {return u.id})
    unitIds.push(unit.id)
    let preyears = []
    let yearsToGetFromDb = []
    let years = []
    let data = {}
    let consecutiveYears = consecutiveYearFromServer
    let directEmissions = []
    let indirectEMissions = []
    let directData = {}
    let indirectData = {}
    consecutiveYears.years.map(obj => {
      if (obj.withCSI) {
        yearsToGetFromDb.push(obj.year)
      } else {
        preyears.push(obj.year)
      }
    })
    yearsToGetFromDb.forEach(y => {
      if (preyears.includes(parseInt(y))){
        preyears.splice(preyears.indexOf(parseInt(y)), 1)
      }
    })
    years.push(...preyears); years.push(...yearsToGetFromDb)
    years.sort()
    if (years.length > 3){
      years = years.slice(-3)
    }
    if (!years.includes(baseYear)){
      years.push(baseYear)
    }
    years.sort()

    let emissions = []
    for await (const year of years){
      if (preyears.includes(year)){
        emissions.push(...await this.getFromPreEmissions(year, unitIds, project.projectType.id))
      } else if (yearsToGetFromDb.includes(year)){
        emissions.push(...await this.getFromDb(year.toString(), unitIds, project.projectType.id))
      } else {
        emissions.push(...await this.getFromPreEmissions(year, unitIds, project.projectType.id))
        if (emissions.length === 0 ){
          emissions.push(...await this.getFromDb(year.toString(), unitIds, project.projectType.id))
        }
      }
    }

    emissions.forEach(emission => {
      emission.emissionSource = emission.emissionSource.name
      if (emission.projectType) {
        let {projectType, createdBy, createdOn, editedBy, editedOn, status, id, ...rest} = emission
        emission = rest
      }
      if (emission.ownership === Ownership.HIRED){
        indirectEMissions.push(emission)
      } else {
        directEmissions.push(emission)
      }
    })

    directEmissions = this.group(directEmissions, 'emissionSource')
    indirectEMissions = this.group(indirectEMissions, 'emissionSource')

    let directTotal = {}
    let dirRows = {}
    let dirIdx = 0
    directData[dirIdx] = []
    dirRows[dirIdx] = 0
    Object.keys(directEmissions).forEach(key => {
      let obj = {}
      obj['name'] = this.convertToTitleCase(key)
      obj['ownership'] = this.group(directEmissions[key], 'ownership')
      obj['ownership'] = Object.keys(obj['ownership']).map(key => {
        let _years = this.group(obj['ownership'][key], 'year')
        let emissions = []
        _years = this.sortObject(_years)
        Object.keys(_years).forEach(y => {
          emissions.push({ year: _years[y][0].year, emission: _years[y][0].e_sc })
        })
        let values = []
        years.map((y, idx) => values.push(idx))
        years = years.map(y => typeof y === 'string' ? parseInt(y) : y)
        emissions.map(e => {
          years.map((y, idx) => {
            if (e.year === y) {
              let emission = parseFloat(e.emission + '')
              let emission_ = emission.toString().replace(/,/g, '')
              if (Object.keys(directTotal).includes(y.toString())) {  
                directTotal[y] += parseFloat(emission_) 
              } else {
                directTotal[y] =  parseFloat(emission_)
              }
              values[idx] = e.emission.toString()
            }
          })
        })
        values = values.map(ele => { if (typeof ele !== 'string') { ele = '-' } return ele })
        return { name: this.convertToTitleCase(key), years: values }
      })
      dirRows[dirIdx] += obj['ownership'].length
      if (dirRows[dirIdx] > 15){
        dirIdx ++
        dirRows[dirIdx] = 1
        directData[dirIdx] = []
        directData[dirIdx].push(obj)
      } else {
        directData[dirIdx].push(obj)
      }

    })

    let totals = []
    years.map((y, idx) => totals.push(idx))
    Object.keys(directTotal).forEach(key => {
      years.map((y, idx) => {
        if (key === y.toString()) {
          totals[idx] = directTotal[key].toString()
        }
      })
    })
    totals = totals.map(ele => { if (typeof ele !== 'string') { ele = '-' } return this.thousandSeperate(parseFloat(ele), 2) })
    // directData.push({
    //   name: "Total direct emissions",
    //   isTotal: true,
    //   years: totals
    // })

    let indirectTotal = {}
    let idrRows = {}
    let indirIdx = 0
    indirectData[indirIdx] = []
    idrRows[indirIdx] = 0
    Object.keys(indirectEMissions).forEach(key => {
      let obj = {}
      obj['name'] = this.convertToTitleCase(key)
      obj['ownership'] = this.group(indirectEMissions[key], 'ownership')
      obj['ownership'] = Object.keys(obj['ownership']).map(key => {
        let _years = this.group(obj['ownership'][key], 'year')
        let emissions = []
        _years = this.sortObject(_years)
        Object.keys(_years).forEach(y => {
          emissions.push({ year: _years[y][0].year, emission: _years[y][0].e_sc })
        })
        let values = []
        years.map((y, idx) => values.push(idx))
        emissions.map(e => {
          years.map((y, idx) => {
            if (e.year === y) {
              // let emission = parseFloat(e.emission + '')
              let emission_ = e.emission.toString().replace(/,/g, '')
              if (Object.keys(indirectTotal).includes(y.toString())) { 
                indirectTotal[y] += parseFloat(emission_) 
              } else {
                indirectTotal[y] =  parseFloat(emission_)
              }
              values[idx] = e.emission.toString()
            }
          })
        })
        values = values.map(ele => { if (typeof ele !== 'string') { ele = '-' } return this.thousandSeperate(parseFloat( ele.toString().replace(/,/g, '')), 2) })
        return { name: this.convertToTitleCase(key), years: values }
      })
      idrRows[indirIdx] += obj['ownership'].length
      if (idrRows[indirIdx] > 15){
        dirIdx ++
        idrRows[indirIdx] = 1
        indirectData[indirIdx] = []
        indirectData[indirIdx].push(obj)
      } else {
        indirectData[indirIdx].push(obj)
      }
    })

    let idrtotals = []
    years.map((y, idx) => idrtotals.push(idx))
    Object.keys(indirectTotal).forEach(key => {
      years.map((y, idx) => {
        if (key === y.toString()) {
          idrtotals[idx] = indirectTotal[key].toString()
        }
      })
    })
    idrtotals = idrtotals.map(ele => { if (typeof ele !== 'string') { ele = '-' } return this.thousandSeperate(parseFloat(ele), 2) })

    let netTotal = []
    years.map((y, idx) => {
      let val = ((directTotal[y] !== undefined && directTotal[y] !== '-') ? parseFloat(directTotal[y]) : 0) +
        ((indirectTotal[y] !== undefined && indirectTotal[y] !== '-') ? parseFloat(indirectTotal[y]) : 0)
      netTotal[idx] = this.thousandSeperate(val, 2)
    })

    let directCat = []
    Object.keys(directData).forEach(key => {
      directCat.push({
        catagary: "Direct emissions",
        numOfRows: dirRows[key],
        emissions: directData[key]
      })
    })

    let indirectCat = []
    Object.keys(indirectData).forEach(key => {
      indirectCat.push({
        catagary: "Indirect emissions",
        numOfRows: idrRows[key],
        emissions: indirectData[key]
      })
    })

    return {
      years: years,
      catagaries: [
        // {
        //   catagary: "Direct emissions",
        //   numOfRows: dirRows,
        //   emissions: directData
        // },
        ...directCat,
        {
          catagary: "Total direct emissions",
          isTotal: true,
          totalCat: 'DIRECT',
          numOfRows: 0,
          emissions: [{
            name: "",
            years: totals,
          }]
        },
        // {
        //   catagary: "Indirect emissions",
        //   numOfRows: idrRows,
        //   emissions: indirectData
        // },
        ...indirectCat,
        {
          catagary: "Total indirect emissions",
          isTotal: true,
          totalCat: 'INDIRECT',
          numOfRows: 0,
          emissions: [{
            name: "",
            years: idrtotals,
          }]
        },
        {
          catagary: "Total GHG emissions",
          isTotal: true,
          totalCat: 'SUBTOTAL',
          numOfRows: 0,
          emissions: [{
            name: "",
            years: netTotal,
          }]
        }
      ]
    }
  }

  async getFromPreEmissions(year: number, unitIds: number[], projectTypeId: number){
    return await this.prevEmissionsRepo.find({
      unit: {id: In(unitIds)}, 
      projectType: {id: projectTypeId},
      year: year
    })

  } 
  async getFromDb(year: string, unitIds: number[], projectTypeId: number){
    let emissions = []
    let p = await this.projectRepo.find({ownerUnit: {id: In(unitIds)}, year: year, projectType: {id: projectTypeId}})
    if (p && p.length > 0){
      let e = await this.getTotal(p[0].id)
      e.emissions.forEach(_e => {
        let esc = {dir: 0, rented: 0, own: 0, hired: 0, other: 0}
        if (_e.direct.esc !== 0) {
          emissions.push({emissionSource: _e.es, year: parseInt(p[0].year), ownership: 'Own/Rented', e_sc: this.thousandSeperate(_e.direct.esc, 2)})
        }
        if (_e.rented.esc !== 0){
          emissions.push({emissionSource: _e.es, year: parseInt(p[0].year), ownership: 'Rented', e_sc: this.thousandSeperate(_e.rented.esc, 2)})
        }
        if (_e.own.esc !== 0) {
          emissions.push({emissionSource: _e.es, year: parseInt(p[0].year), ownership: 'Own', e_sc: this.thousandSeperate(_e.own.esc, 2)})
        }
        if (_e.hired.esc !== 0) {
          emissions.push({emissionSource: _e.es, year: parseInt(p[0].year), ownership: 'Hired', e_sc: this.thousandSeperate(_e.hired.esc, 2)})
        }
        if (_e.other.esc !== 0) {
          emissions.push({emissionSource: _e.es, year: parseInt(p[0].year), ownership: 'Other', e_sc: this.thousandSeperate(_e.other.esc, 2)})
        }
      })
    }
    return emissions
  }
  sortObject(obj) {
    return Object.keys(obj).sort().reduce(function (result, key) {
      result[key] = obj[key];
      return result;
    }, {});
  }
  group(list: any[], prop: string | number){
    return list.reduce((groups, item) => ({
      ...groups,
      [item[prop]]: [...(groups[item[prop]] || []), item]
    }), {});
  }

  async getOrganizationalComaprisonData(data: any, project: Project, unitDetail: UnitDetails){
    let years = [...data.years]
    let prevYear = ''
    let emissions = data.catagaries[data.catagaries.length - 1].emissions[0].years
    let inventoryPrevPercentage = 0
    let inventoryPrevBehavior = ''
    let inventoryBasePercentage = 0
    let inventoryBaseBehavior = ''
    let totalBehavior = ''

    let originalYears = [...years]
    let totEmissions = []

    let inventoryEmission = emissions[originalYears.indexOf(parseInt(project.year))]
    let baseEmission = unitDetail.baseYearEmission
    totEmissions.push(this.thousandSeperate(baseEmission, 2))
    totEmissions.push(inventoryEmission)
    inventoryBasePercentage = (Math.abs(parseFloat(inventoryEmission.replace(/,/g, '')) - baseEmission)/baseEmission) * 100
    if ((parseFloat(inventoryEmission.replace(/,/g, '')) - baseEmission) > 0) { inventoryBaseBehavior = 'greater than' }
    else { inventoryBaseBehavior = 'lesser than' }

    years.splice(years.indexOf(unitDetail.baseYear), 1)
    if (years.length > 1){
      prevYear = years[years.indexOf(parseInt(project.year))-1]
      let preEmission = emissions[years.indexOf(prevYear)]
      if (preEmission) totEmissions.push(this.thousandSeperate(preEmission, 2))
      inventoryPrevPercentage = (Math.abs(parseFloat(inventoryEmission) - preEmission)/preEmission) * 100
      if ((parseFloat(inventoryEmission) - preEmission) > 0) {inventoryPrevBehavior = 'greater than'; totalBehavior= 'increase'}
      else {inventoryPrevBehavior = 'lesser than'; totalBehavior = 'reduction'}
    }

    return {
      years: originalYears,
      emissions:totEmissions,
      prevYear: prevYear,
      inventoryPrevPercentage: inventoryPrevPercentage,
      inventoryPrevBehavior: inventoryPrevBehavior,
      inventoryBasePercentage: inventoryBasePercentage,
      inventoryBaseBehavior: inventoryBaseBehavior,
      totalBehavior: totalBehavior
    }
  }

  async getGHGComparisonData(data: any, project: Project, baseYear: number, dataCat: string, totalCat: string) {
    let sources = {}
    let years = [...data.years]
    let inventoryBasePercentage 
    let inventoryBaseBehavior = ''
    let inventoryPrevPercentage
    let inventoryPrevBehavior = ''
    let emissions

    data.catagaries.forEach(cat => {
      if (cat.catagary === dataCat){
        cat.emissions.forEach(es => {
          let tot = 0
          es.ownership.forEach(o => {
            tot += o.years.reduce((partialSum, a) => partialSum + ((a !== undefined && a !== '-') ? parseFloat(a.replace(/,/g, '')) : 0), 0);
          })
          sources[es.name] = tot
        })
      }

      if (cat.totalCat === totalCat) {
        emissions = cat.emissions
        let inventoryEmission = emissions[0].years[years.indexOf(parseInt(project.year))]
        if (emissions[0].years[years.indexOf(baseYear)] !== '-') {
          let baseEmission = emissions[0].years[years.indexOf(baseYear)]
          inventoryBasePercentage = (Math.abs(parseFloat(inventoryEmission.replace(/,/g, '')) - baseEmission) / baseEmission) * 100
          if (parseFloat((inventoryEmission.replace(/,/g, ''))) - baseEmission > 0) inventoryBaseBehavior = 'increase'
          else inventoryBaseBehavior = 'decrease'
        }

        years.splice(years.indexOf(baseYear), 1)

        if (years.length > 1) {
          let prevYear = years[years.indexOf(parseInt(project.year)) - 1]
          if (emissions[0].years[years.indexOf(prevYear)] !== '-') {
            let prevEmission = emissions[0].years[years.indexOf(prevYear)]
            inventoryPrevPercentage = (Math.abs(parseFloat(inventoryEmission.replace(/,/g, '')) - prevEmission) / prevEmission) * 100
            if ((parseFloat(inventoryEmission.replace(/,/g, '')) - prevEmission) > 0) inventoryPrevBehavior = 'increase'
            else inventoryPrevBehavior = 'decrease'
          }

        }

      }
    })
    // data.catagaries[dataIdx].emissions.forEach(es => {
    //   let tot = 0
    //   es.ownership.forEach(o => {
    //     tot += o.years.reduce((partialSum, a) => partialSum + ((a !== undefined && a !== '-') ? parseFloat(a) : 0), 0);
    //   })
    //   sources[es.name] = tot
    // })
    sources = Object.keys(sources)
      .sort((a, b) => sources[b] - sources[a])
      .reduce(
        (_sortedObj, key) => ({
          ..._sortedObj,
          [key]: sources[key]
        }),
        {}
      );

    // emissions = data.catagaries[totalIdx].emissions
    // let inventoryEmission = emissions[0].years[years.indexOf(project.year)]
    // if (emissions[0].years[years.indexOf(baseYear)] !== '-'){
    //   let baseEmission = emissions[0].years[years.indexOf(baseYear)]
    //   inventoryBasePercentage = (Math.abs(inventoryEmission - baseEmission) / baseEmission) * 100
    //   if ((inventoryEmission - baseEmission) > 0) inventoryBaseBehavior = 'increased'
    //   else inventoryBaseBehavior = 'decreased'
    // }

    // years.splice(years.indexOf(baseYear), 1)
    
    // if (years.length > 1){
    //   let prevYear = years[years.indexOf(project.year)-1]
    //   if (emissions[0].years[years.indexOf(prevYear)] !== '-'){
    //     let prevEmission = emissions[0].years[years.indexOf(prevYear)]
    //     inventoryPrevPercentage = (Math.abs(inventoryEmission - prevEmission) / prevEmission) * 100
    //     if ((inventoryEmission - prevEmission) > 0) inventoryPrevBehavior = 'increased'
    //     else inventoryPrevBehavior = 'decreased'
    //   }
      
    // }
    
    return {
      years: data.years,
      largest: Object.keys(sources)[0],
      followed: [Object.keys(sources)[1], Object.keys(sources)[2], Object.keys(sources)[3]],
      inventoryBaseBehavior: inventoryBaseBehavior,
      inventoryBasePercentage: inventoryBasePercentage,
      inventoryPrevBehavior: inventoryPrevBehavior,
      inventoryPrevPercentage: inventoryPrevPercentage,
    }
  }

  async getPerCapitaData(data, unitDetail){
    let totalData = data.catagaries[4].emissions[0].years
    let years = data.years
    let firstPer = 0
    let lastPer = 0
    let firstInt = 0
    let lastInt = 0
    let behavior1 = ''
    let behavior2 = ''
    let intBehavior = ''
    let firstYearEmp = await this.numEmployeeRepo.find({year: years[0], unitDetail: {id: unitDetail.id}})
    if (firstYearEmp.length > 0 && firstYearEmp[0].totalEmployees !== 0){
      firstPer = parseFloat(totalData[0].replace(/,/g, ''))/firstYearEmp[0].totalEmployees
      firstInt = parseFloat(totalData[0].replace(/,/g, ''))/firstYearEmp[0].totalRevenue
    }
    let lastYearEmp = await this.numEmployeeRepo.find({year: years[years.length-1], unitDetail: {id: unitDetail.id}})
    if (lastYearEmp.length > 0 && lastYearEmp[0].totalEmployees !== 0){
      lastPer = parseFloat(totalData[years.length-1].replace(/,/g, ''))/lastYearEmp[0].totalEmployees
      lastInt = parseFloat(totalData[years.length-1].replace(/,/g, ''))/lastYearEmp[0].totalRevenue
    }

    let diff = lastPer - firstPer
    if (diff < 0) {behavior1 = 'decreasing'; behavior2 = 'decreased'}
    else{ behavior1 = 'increasing'; behavior2 = 'increased'}

    let intDiff = lastInt - firstInt
    if (intDiff < 0) intBehavior = 'reduced'
    else intBehavior = 'increased'

    return {
      behavior1: behavior1,
      behavior2: behavior2,
      firstPerCapita: firstPer,
      lastPerCapita: lastPer,
      intBehavior: intBehavior
    }

  }

  async getGlossaryOfTerms(projectId: number){
    let pes = await this.pesService.find({project: {id: projectId}})
    let codes = pes.map(es => es.emissionSource.code)
    let terms = glossaryOfTerms.filter(o => codes.includes(o.code))


    return terms
  }

  formatBoundaryTableData(direct, indirect){
    let data: {direct: '', indirect: ''}[] = []
    let len = 0
    if (direct.length > indirect.length){
      len = direct.length
    } else {
      len = indirect.length
    }
    for (let i = 0; i < len; i++){
      let obj:{direct: '', indirect: ''}  = {direct: '', indirect: ''}
      if (direct[i]){
        obj.direct = direct[i]
      } 

      if (indirect[i]){
        obj.indirect = indirect[i]
      } 
      data.push(obj)
    }
    return data
  }

  nth(n) { return ["st", "nd", "rd"][((n + 90) % 100 - 10) % 10 - 1] || "th" }

  convertToTitleCase(str: string) {
    if (str === sourceName.t_n_d_loss){
      str = 'T&D Loss'
    } else if (str === sourceName.passenger_road){
      str = 'Employee Commuting'
    }
    str = str.replace("_", " ")
    str = str.toLowerCase()
    let formatted = str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    if (formatted.includes('Freight') || formatted.includes('Passenger')){
      formatted = formatted.replace(' ', ' - ')
    }
    return formatted
  }

  checkVal(value: number){
    if (value < 0){
      return '-'
    } else if (Number.isNaN(value)){
      return '-'
    } else {
      return value
    }
  }

  checkValRes(value: number){
    if (value < 0){
      return 0
    } else if (Number.isNaN(value)){
      return 0
    } else {
      return value
    }
  }

  thousandSeperate(value: any, decimals: number){
    try{
      if ((value !== undefined)) {
        if (value === '-'){
          return value
        } else if (isNull(value)) {
          return '-'
        } else if (isNaN(value)){
          return '-'
        } else if ((typeof value) === 'string' && value.includes('e')){
          return parseFloat(value).toExponential(decimals)
        }
         else {
          return parseFloat(value.toFixed(decimals)).toLocaleString('en')
        }
      } else {
        return '-'
      }
    } catch(error){
      console.log(error)
      return value
    }
  }

  async allowClientToGenerate(id: string, isAllowed: string){
    try{
      const updated = await this.repo.update( {
        id: parseInt(id)
       }, { allowClientGenerate: isAllowed === 'true' ? true : false });
   
       if(updated.affected === 1){
         return {
           status: true,
           message: "Successfully removed"
         };
       }else{
         return {
           status: false,
           message: "Failed to removed"
         }
       }
    }catch(errr){
      console.error(errr)
      throw new InternalServerErrorException(errr);
    }
  }

  randColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
  }
}
