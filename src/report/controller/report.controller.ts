import { Controller, Get, Post, Body, Patch, Param, Delete, Response, InternalServerErrorException, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { EmissionSourceService } from 'src/emission/emission-source/service/emission-source.service';
import { GenerateDto } from '../dto/generate.dto';
import { coverAndSecondPage, boundries, CreateReportDto, exicutiveSummery, glossaryOfTerms, introduction, result } from '../dto/create-report.dto';
import { GraphsDto } from '../dto/graphs.dto';
import { Report } from '../entities/report.entity';
import { ReportService } from '../service/report.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

class ReportData{

}

@Crud({
  model: {
    type: Report,
  },
  query: {
    join: {
      unit: {
        eager: true
      },
      project: {
        eager: true
      },
      nextSteps: {
        eager: true
      },
      recommendations: {
        eager: true
      }
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('report')
export class ReportController implements CrudController<Report> {

  graphSaveDitection:string="http://localhost:7080/report/graphs"
  graphSaveDirectory:string='./public/report/figures/figure'
  // companyName:string="";
  climateSIName:string="Climate Smart Initiatives (Pvt.) Ltd";
  // companyLogoLink:string="";
  // climateSILogoLink:string="";
  // baseYear:string=""
  // inventryYear:string=""

  constructor(
    private readonly reportService: ReportService,
    public service: ReportService,
  ) {}

 
  get base(): CrudController<Report> {
    return this;
  }

  @Post('generate-report')
  async generateReport(
    @Response() res,
    // @Param('unitId') unitId: number,
    // @Param('projectId') projectId: number,
    // @Param('types') types: any[]
    @Body() req: GenerateDto
    ) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline;filename=yolo.pdf');

    try {
      this.service.populateReport(req.unitId, req.projectId, req.types, req.versionName)
      .then(async res_ => {
        let report = this.finalReportGenarate(res_)
        await this.service.saveReport(res_.reportName, res_.generateReportName, req.unitId, req.projectId,req.versionName)
        return res.send(report)
      }).catch(err =>{
        throw new InternalServerErrorException("Report generating is failed")
      })
    } catch(error){throw new InternalServerErrorException("Report generating is failed"); }
  }

  @Get('test-total')
  async testTot(){
    // return await this.service.getTotal(10, 445)
  }

  @Get('testGraph')
  public async testGraph( @Body() data:GraphsDto):Promise<any> {

    //await this.service.populateReport(445, 10)
    //await this.service.getElectricityEmissionFactors(data.data, data.data, data.data)
     let graph = await this.service.exicutiveSummeryGraph(1, 1)
     await this.service.resultGraphs(1, 1)
     await this.service.comparisonGraphs(1, 1 , "GHG", data.data)

    //console.log(graph)


   return 
  //  res.send(await this.exicutiveSummeryGraph()),
  //         res.send(await this.resultGraphs()),
  //         res.send(await this.comparisonGraphs())
  }

  @Post('allow-genrate')
  async allowClientToGenerate(
    @Query('id') id: string, @Query('isAllow') isAllow: string
  ){
    return await this.service.allowClientToGenerate(id, isAllow)
  }


  @Get('finalreport')
  async FinalReport(
    @Response() res
  ):Promise<any> {

    console.log("test");
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline;filename=yolo.pdf');
    const reportDto=new CreateReportDto();
   return res.send(await this.finalReportGenarate(reportDto))
  }

  async report(untId: number, projectId: number):Promise<any>{
    let d = new ReportData();


    
    this.test(d);
  }
  @Get('total')
  async test(data: ReportData): Promise<string>{
    // this.service.getTotal(1)
    return null;
  }

  async finalReportGenarate(reportDto:CreateReportDto):Promise<any>{
   

    this.climateSIName=reportDto.climateSIName;
    const baseYear=reportDto.baseYear;
    const companyName= reportDto.companyName
    const inventryYear=reportDto.inventryYear;
    const companyLogoLink=reportDto.companyLogoLink;
    const climateSILogoLink=reportDto.climateSILogoLink;
    
   const header=` <div class="header">
                    <div class="row ">
                      <div class="col-8 align-self-center">
                          Greenhouse Gas Inventory Report – ${companyName}
                      </div>
                      <div class="col-4 align-self-center">
                          <img height="50px" src="${companyLogoLink}" >
                      </div>
                    </div>
                    <div  class="row"></div>
                  </div>`;

   const footer=` <div  class="footer">
                    <div class="row ">
                        <div style="background-color: #082160;" class="col-4"></div>
                        <div style="background-color: green;" class="col-4"></div>
                        <div style="background-color: yellow;" class="col-4"></div>
                    </div>
                    <div class="row ">
                        <div class="col-2 align-self-center"> #pageNumber# | Page</div>
                        <div class="col-9  align-self-start">${this.climateSIName}</div>
                        <div class="col-1 align-self-center">  <img height="50px" src="${climateSILogoLink}" ></div>
                    </div>
                  </div>`




    const html_to_pdf = require('html-pdf-node');
    let fileName = reportDto.generateReportName;
    let options = {
      format: 'A4',
      margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' },
      path: './public/' + fileName,
      printBackground: true
    };
    
    let file = {
      content:
        `<!DOCTYPE html>
        <html lang="en">
        <head>
        <title>Bootstrap Example</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-iYQeCzEYFbKjA/T2uDLTpkwGzCiq6soy8tYaI1GyVh/UjpbCx/TYkiZhlZB6+fzT" crossorigin="anonymous">
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-u1OknCvxWvY5kfmNBILK2hRnQC3Pr17a+RTT6rIHI7NnikvbZlHgTPOOmMi466C8" crossorigin="anonymous"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
        <link rel="stylesheet" href="http://localhost:7080/report/css/reportserver.css">
            </head>
  
  
            <body>
            ${await this.coverAndSecondPage(reportDto.coverAndSecondPage,header,footer,reportDto.companyLogoLink,reportDto.climateSILogoLink,companyName,baseYear,inventryYear)}
            ${await this.exicutiveSummery(reportDto.exicutiveSummery,header,footer,companyName,baseYear,inventryYear)}
            ${await this.tableOfContent(reportDto.tableOfContent,header,footer,baseYear)}
            ${await this.listOfTableandlistOfFigures(reportDto.listOfTableandlistOfFigures,header,footer,inventryYear)}
            ${await this.glossaryOfTerms(reportDto.glossaryOfTerms,header,footer,inventryYear)}
            ${await this.introduction(reportDto.introduction,header,footer,companyName,baseYear,inventryYear)}
            ${await this.boundries(reportDto.boundries,header,footer,companyName)}
            ${await this.quantification(reportDto.quantification,header,footer,companyName,baseYear,inventryYear)}
            ${await this.result(reportDto.result,header,footer,companyName,baseYear,inventryYear)}
            ${await this.comparison(reportDto.comparison,header,footer,companyName,baseYear,inventryYear)}
            ${await this.conclution(reportDto.conclution,header,footer,companyName,inventryYear)}
            ${await this.recomendation(reportDto.recomendation,header,footer)}
            ${await this.ongoinGhgMitigation(reportDto.ongoinGhgMitigation,header,footer,companyName)}
            ${await this.nextSteps(reportDto.nextSteps,header,footer)}
          




            </body></html>`

            // ${await this.annex(reportDto.annex,header,footer)}  this page was removes  from report
          }
          // http://localhost:7080/report/cover/
          return await html_to_pdf.generatePdf(file, options)
          
          
  }
async coverAndSecondPage(coverAndSecondPage: coverAndSecondPage,header,footer,companyLogoLink,climateSILogoLink,companyName,baseYear,inventryYear):Promise<string>{


  
  let coverImageLink=coverAndSecondPage.coverImageLink;
  

  let pageNumber=2;

  const cover=`<div id="cover">
  <div  style="height: 250px;">
  <div  class="row ">
      <div  class="col ">
      <img height="50px" src="${companyLogoLink}" >
      </div>                
  </div>
  <div class="row ">
      <div class="col h2">
          GREENHOUSE GAS INVENTORY REPORT
      </div>
  </div>
  <div class="row ">
      <div class="col h4">
          ${companyName}
      </div>
  </div>
  <div class="row ">
      <div class="col h4">
          INVENTORY YEAR ${inventryYear}
      </div>
  </div>
  </div>
  <div style="height: 650px;margin-top: 100px;margin-bottom: 0px;" >
      <img height="100%" width="100%"  src="${coverImageLink}" > 
  </div>
  <div style="height: 100px;margin-bottom: 50px;margin-top: 50px;" >
  <div class="row ">
      
      <div class="col-2">
          <img height="100px" style="padding: 0px;" src="${climateSILogoLink}" >
      </div>
  </div>
  </div>
  </div>`;


const companyAdressLine1=coverAndSecondPage.companyAdressLine1;
const companyAdressLine2=coverAndSecondPage.companyAdressLine2;
const companyAdressLine3=coverAndSecondPage.companyAdressLine3;
const companyregistrationNumber=coverAndSecondPage.companyregistrationNumber;
const companyEmailAdress=coverAndSecondPage.companyEmailAdress;
const companyFax=coverAndSecondPage.companyFax;
const companyTelephone=coverAndSecondPage.companyTelephone;



const climateSiAdressLine1=coverAndSecondPage.climateSiAdressLine1;
const climateSiAdressLine2=coverAndSecondPage.climateSiAdressLine2;
const climateSiAdressLine3=coverAndSecondPage.climateSiAdressLine3;
const climateSiRegistrationNumber=coverAndSecondPage.climateSiRegistrationNumber;
const climateSiEmail=coverAndSecondPage.climateSiEmail;
const climateSiFax=coverAndSecondPage.climateSiFax;
const climateSitelephone=coverAndSecondPage.climateSitelephone;
const version=coverAndSecondPage.version

  const secondPage=`<div id="page_2" class=" page  text-center" >
 
  ${header}

  <div class="content">
  <div  style="height: 40px; padding-top: 10px;margin-left: 100px; margin-right: 100px;"  class="row">
  This report was prepared for the sole purpose of the following authority:
  </div>
<div style=" height: 450px;margin-top: 10px;margin-left: 100px; margin-right: 100px;"  class="row  ">
<div  class="col-5 align-self-start"> <img style="margin-top: 70px;" height="50px" src="${companyLogoLink}" ></div>
<div  class="col-7">
  
      <ul style="margin-top: 50px;list-style: none;" class="list-group list-group-flush text-start">
      <li  style="margin-top: 15px;">${companyName}</li>
      <li  style="margin-top: 15px;">Address: ${companyAdressLine1}</li>
      <li  style="margin-top: 15px;">${companyAdressLine2}</li>
      <li  style="margin-top: 15px;">${companyAdressLine3}</li>
      <li  style="margin-top: 15px;">Company registration No: ${companyregistrationNumber}</li>
      <li  style="margin-top: 15px;">E-mail: ${companyEmailAdress}</li>
      <li style="margin-top: 15px;">Telephone: ${companyTelephone}</li>
      <li  style="margin-top: 15px;">Fax: ${companyFax}</li>
      </ul>

  </div>
</div>

<div style="height: 10px; margin-top: 10px;margin-left: 100px; margin-right: 100px;" class="row">
  The assessment was carried out and the report was prepared by:
</div>
<div style=" height: 450px;margin-top: 10px;margin-left: 100px; margin-right: 100px;" class="row">
  <div  class="col-5 align-self-start">
      <img height="100px" style="padding: 0px;margin-top: 80px;" src="${climateSILogoLink}" ></div>
<div  class="col-7">

  <ul style="margin-top: 50px;list-style: none;" class="list-group list-group-flush text-start">
   
      <li style="margin-top: 15px;">Address:${climateSiAdressLine1}</li>
      <li style="margin-top: 15px;" >${climateSiAdressLine2}</li>
      <li style="margin-top: 15px;">${climateSiAdressLine3}</li>
      <li style="margin-top: 15px;">Company registration No: ${climateSiRegistrationNumber}</li>
      <li style="margin-top: 15px;">E-mail: ${climateSiEmail}</li>
      <li style="margin-top: 15px;">Telephone: ${climateSitelephone}</li>
      <li  style="margin-top: 15px;">Fax: ${climateSiFax}</li>
      <li style="margin-top: 80px;">Reporting period: Inventory Year ${inventryYear}</li>
      <li style="margin-top: 20px;">Version of the report:${version}</li>
      </ul>
</div>
</div>
  </div>

  ${footer.replace("#pageNumber#",pageNumber.toString())}
   </div>`



return cover+secondPage;
  
}


async exicutiveSummery(exicutiveSummery: exicutiveSummery,header,footer,companyName,baseYear,inventryYear):Promise<string>{
  let pageNumber=3;


  const sector=exicutiveSummery.sector ;
  const country=exicutiveSummery.country ;
  const emissionType=exicutiveSummery.emissionType ;
  const consicitiveYear=exicutiveSummery.consicitiveYear ;
  const timePiriod=exicutiveSummery.timePiriod ;
  const boundry=exicutiveSummery.boundry ;
  const accordance=exicutiveSummery.accordance ;
  const paragraph_1=exicutiveSummery.paragraph_1 ;

  const figure_1_link=exicutiveSummery.figure_1_link ;


  const page_one=` <div id="page_3" class="page text-center" >
  ${header}
  <div class="content">
  
  <div  class="main_header text-start">EXECUTIVE SUMMARY</div>
  <blockquote class=" paragraph blockquote text-start ">
    <p class="mb-0 lh-base">Global warming is an overwhelming environmental issue caused due to release of greenhouse
         gases (GHGs) to the atmosphere by man-made activities since the industrial revolution.
         Reducing atmospheric emissions is now a major task for a company to become more environmentally friendly and conscious.</p>
  </blockquote>
  <blockquote class=" paragraph blockquote text-start">
    <p class="mb-0 lh-base">${companyName}, as a carbon conscious ${sector} in  ${country}
        , has decided to measure and report its  ${emissionType} for  ${consicitiveYear}.  </p>
  </blockquote>

  <blockquote class=" paragraph blockquote text-start">
    <p class="mb-0 lh-base">This report details the quantification of GHG emissions of  ${companyName} for the year  ${timePiriod}.
    ${boundry}  </p>
  </blockquote>
  <blockquote class=" paragraph blockquote text-start">
    <p class="mb-0 lh-base">This study quantifies and reports the organizational level GHG emissions based on data received from the  ${companyName} in accordance with  ${accordance} All GHG emissions were reported as tonnes of CO₂ equivalent (tCO₂e).  </p>
  </blockquote>
  <blockquote class=" paragraph blockquote text-start">
    <p class="mb-0 lh-base">Reporting of GHG emissions were more comprehensive as it includes not only direct GHG emissions but
         also wide range of indirect GHG emissions, which are not within the control of the organization.
            </p>
  </blockquote>
  <div  class="image-medium text-start"><figure class="figure ">
    <img src="${figure_1_link}" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
    <figcaption class="figure-caption">Figure 1: GHG emissions for inventory year ${inventryYear}</figcaption>
  </figure></div>
  
  
  
  
  
  
  </div>

  ${footer.replace("#pageNumber#",pageNumber.toString())}

   </div>`


const emission_amount=exicutiveSummery.emission_amount ;
const capitaEmission=exicutiveSummery.capitaEmission ;
const intensityEmission=exicutiveSummery.intensityEmission ;

const figure_2_link=exicutiveSummery.figure_2_link ;

const highest_emission=exicutiveSummery.highest_emission ;
const second_highest_emission=exicutiveSummery.second_highest_emission ;
const third_emission=exicutiveSummery.third_emission ;

const page_two=`  <div id="page_4" class="page text-center" >
${header}
<div class="content">

<blockquote class=" paragraph blockquote text-start ">
<p class="mb-0 lh-lg">As Figure 1 illustrates, the total carbon footprint of ${companyName}, for the ${inventryYear} is ${emission_amount}.</p>
</blockquote>
<blockquote class=" paragraph blockquote text-start ">
<p class="mb-0 lh-lg">   Per capita emissions and emission intensity for the assessment year are ${capitaEmission} 
  per person and ${intensityEmission} per million rupees respectively (considering direct and indirect emissions).</p>
</blockquote>
<div style="margin-top: 50px;" class="image-larg "><figure class="figure ">
<img src="${figure_2_link}" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
<figcaption class="figure-caption">Figure 2: GHG emissions by source for the inventory year ${inventryYear}</figcaption>
</figure></div>
<blockquote class=" paragraph blockquote text-start ">
<p class="mb-0 lh-lg"> As per Figure 2, GHG emissions due to ${highest_emission}, is the largest GHG emission source, which 
  is followed by ${second_highest_emission}, and ${third_emission}.</p>
</blockquote>

</div>

${footer.replace("#pageNumber#",(++pageNumber).toString())}

 </div>`



  return page_one+ page_two;
    
    }
    async tableOfContent(tableOfContent: object,header,footer,baseYear):Promise<string>{

      let pageNumber=5;

      const page_one=`  <div id="page_5" class="page text-center" >
      ${header}
      <div class="content">
      <div class="table-of-content ">
      <div  class="table-of-content-main-headers text-start">Table of Contents</div>
      <div class="table-of-content-header-item"><div >SUMMARY.......................................................................................................................................................................................</div><div ><bdi>.............3</bdi></div> </div>
      <div class="table-of-content-header-item" ><div >List of Tables ....................................................................................................................................................................</div><div ><bdi>.............7</bdi></div> </div>
      <div class="table-of-content-header-item"><div >List of Tables ................................................................................................................................................................</div><div ><bdi>.................7</bdi></div> </div>
      <div class="table-of-content-header-item"><div >1 INTRODUCTION ....................................................................................................................................................................</div><div ><bdi>.............10</bdi></div> </div>
      
        
        <div class="table-of-content-sub-header-item"><div >1.1 Introduction to the organization ................................................................................................................................</div><div ><bdi>.................11</bdi></div> </div>
        <div class="table-of-content-sub-header-item"><div >1.2 Persons responsible ..................................................................................................................................................</div><div ><bdi>.............11</bdi></div> </div>
        <div class="table-of-content-sub-header-item"><div >1.3 Purpose of the report ..................................................................................................................................................</div><div ><bdi>.............11</bdi></div> </div>
        <div class="sub-sub table-of-content-sub-header-item"> <div >1.4 Intended users ........................................................................................................................................................................</div><div ><bdi>.....11</bdi></div></div>
        <div class="table-of-content-sub-header-item"><div >1.5 Dissemination policy ....................................................................................................................................................</div><div ><bdi>.....12</bdi></div> </div>
        <div class="table-of-content-sub-header-item"><div >1.6 Reporting period and frequency of reporting .........................................................................................................................................................</div><div ><bdi>.....12</bdi></div> </div>
        <div class="table-of-content-sub-header-item"><div >1.7 Base year .........................................................................................................................................................</div><div ><bdi>.....12</bdi></div> </div>
        <div class="table-of-content-sub-header-item"><div >1.8 Data and information (List of GHGs account)  .........................................................................................................................................................</div><div ><bdi>.....12</bdi></div> </div>
       

        <div class="table-of-content-header-item"><div >2 BOUNDARIES.................................................................................................................................................................</div><div ><bdi>.....13</bdi></div> </div>
        <div class="table-of-content-sub-header-item"><div >2.1 Setting up the organizational boundaries ................................................................................................................................</div><div ><bdi>.................13</bdi></div> </div>
        <div><div class="sub-sub table-of-content-sub-header-item"> <div >2.1.1 Control approach ........................................................................................................................................................................</div><div ><bdi>.....13</bdi></div></div></div>
        <div class="table-of-content-sub-header-item"><div >2.2 Reporting boundaries ....................................................................................................................................................</div><div ><bdi>.....14</bdi></div> </div>
        <div><div class="sub-sub table-of-content-sub-header-item"> <div >2.2.1 Direct GHG emissions ........................................................................................................................................................................</div><div ><bdi>.....14</bdi></div></div></div>
        <div><div class="sub-sub table-of-content-sub-header-item"> <div >2.2.2 Indirect emissions ........................................................................................................................................................................</div><div ><bdi>.....14</bdi></div></div></div>

        <div class="table-of-content-header-item"><div >3 QUANTIFICATION OF GHG EMISSIONS AND REMOVALS.................................................................................................................................................................</div><div ><bdi>.....16</bdi></div> </div>
        <div class="table-of-content-sub-header-item"><div >3.1 Methodology ............................................................................................................................................................................</div><div ><bdi>.................16</bdi></div> </div>
        <div class="table-of-content-sub-header-item"><div >3.2 Emission factors and other constants ......................................................................................................................................................</div><div ><bdi>.................19</bdi></div> </div>
       
      </div>
   
      
      </div>
      
      ${footer.replace("#pageNumber#",(pageNumber++).toString())}
      
       </div>`

       const page_two=`  <div id="page_6" class="page text-center" >
       ${header}
       <div class="content">
       <div class="table-of-content ">
                
       <div class="table-of-content-sub-header-item"><div >3.3 Uncertainties .......................................................................................................................................................................</div><div ><bdi>................21</bdi></div> </div>
       <div class="table-of-content-sub-header-item"><div >3.4 Exclusions ..........................................................................................................................................................................</div><div ><bdi>.................23</bdi></div> </div>
       <div class="table-of-content-header-item"><div >4 RESULTS: EVALUATION OF GREENHOUSE GAS INVENTORY ...........................................................................................................................................</div><div ><bdi>................24</bdi></div> </div>
       <div class="table-of-content-sub-header-item"><div >4.1 Direct GHG emissions ................................................................................................................................................................</div><div ><bdi>.................26</bdi></div> </div>
       <div class="table-of-content-sub-header-item"><div >4.2 Indirect GHG emissions ............................................................................................................................................................</div><div ><bdi>.................27</bdi></div> </div>
       <div class="table-of-content-header-item"><div >5 COMPARISON OF CARBON FOOTPRINT OF ${baseYear} WITH THE BASE YEAR ...............................................................................................................................</div><div ><bdi>................29</bdi></div> </div>
       <div class="table-of-content-sub-header-item"><div >5.1 Comparison of organizational GHG emissions ........................................................................................................................................</div><div ><bdi>.................29</bdi></div> </div>
       <div class="table-of-content-sub-header-item"><div >5.2 Comparison of organizational carbon footprint over the years .......................................................................................................................</div><div ><bdi>.................30</bdi></div> </div>
       <div class="table-of-content-sub-header-item"><div >5.3 Comparison of direct GHG emissions over the years ................................................................................................................................</div><div ><bdi>.................31</bdi></div> </div>
       <div class="table-of-content-sub-header-item"><div >5.4 Comparison of indirect GHG emissions over the years ................................................................................................................................</div><div ><bdi>.................32</bdi></div> </div>
       <div class="table-of-content-sub-header-item"><div >5.5 Comparisons of emission factors & other constant ..............................................................................................................................</div><div ><bdi>.................32</bdi></div> </div>
       <div class="table-of-content-sub-header-item"><div >5.6 Comparisons of per capita emission and emission intensity ...............................................................................................................................</div><div ><bdi>.................33</bdi></div> </div>
       <div class="table-of-content-header-item"><div >6 CONCLUSION .......................................................................................................................................................................................</div><div ><bdi>................34</bdi></div> </div>
       <div class="table-of-content-header-item"><div >7 RECOMMENDATIONS ...........................................................................................................................................................................</div><div ><bdi>................35</bdi></div> </div>
       <div class="table-of-content-sub-header-item"><div >7.1 Information management system .................................................................................................................................................................</div><div ><bdi>................35</bdi></div> </div>
       <div class="table-of-content-header-item"><div >8 ONGOING GHG MITIGATION AND REMOVAL ENHANCEMENT PROJECTS OF THE BANK.................................................................................................................................................................</div><div ><bdi>................36</bdi></div> </div>
       <div class="table-of-content-header-item"><div >9 NEXT STEPS .......................................................................................................................................................................................</div><div ><bdi>................37</bdi></div> </div>
       <div class="table-of-content-header-item"><div >ANNEX 1 .......................................................................................................................................................................................</div><div ><bdi>................38</bdi></div> </div>
     </div>
    
       
       </div>
       
       ${footer.replace("#pageNumber#",(++pageNumber).toString())}
       
        </div>`
      return page_one+page_two;
        
      }

async listOfTableandlistOfFigures(listOfTableandlistOfFigures: object,header,footer,inventryYear):Promise<string>{


  let pageNumber=7; 

  const page_one= ` <div id="page_7" class="page text-center" >
         ${header}
         <div class="content">
         <div class="list-of-content ">
         <div  class="list-of-content-main-headers text-start">List of Tables</div> 
         <div class="list-of-content-header-item"><div > Activity data used for quantifying GHGs. ......................................................................................................................................................................</div><div ><bdi>.....17</bdi></div> </div>
         <div class="list-of-content-header-item" ><div > Emission factors and other constants used for quantifying GHGs .............................................................................................................................</div><div ><bdi>.....19</bdi></div> </div>
         <div class="list-of-content-header-item"><div >List of excluded emission sources.........................................................................................................................................................................</div><div ><bdi>.....23</bdi></div> </div>
         <div class="list-of-content-header-item"><div > List of excluded emission sources...................................................................................................................................................................................</div><div ><bdi>.....24</bdi></div> </div>
         <div class="list-of-content-header-item"><div > Direct emissions for inventory year 2020...........................................................................................................................................................</div><div ><bdi>.....26</bdi></div> </div>
         <div class="list-of-content-header-item"><div > Indirect emissions for inventory year 2020 .................................................................................................................................................................................................</div><div ><bdi>.....27</bdi></div> </div>
         <div class="list-of-content-header-item"><div >Comparison of GHG inventories over the years ........................................................................................................................................................</div><div ><bdi>.....29</bdi></div> </div>
         <div class="list-of-content-header-item"><div > Comparison of emission factor of grid electricity and T&D loss ........................................................................................................................................</div><div ><bdi>.....33</bdi></div> </div>

         </div>
         <div class="spacer"></div>

             
         <div class="list-of-content ">
           <div  class="list-of-content-main-headers text-start">List of Figures</div> 
           <div class="list-of-content-header-item"><div >Figure 1: GHG emissions for inventory year 2020 ..........................................................................................................................................................................................................</div><div ><bdi>.....3</bdi></div> </div>
           <div class="list-of-content-header-item" ><div >Figure 2: GHG emissions by source...................................................................................................................................................................................................................</div><div ><bdi>.....4</bdi></div> </div>
           <div class="list-of-content-header-item"><div >Figure 3: Direct and Indirect GHG emission sources selected for the inventory ........................................................................................................................................................................</div><div ><bdi>.....15</bdi></div> </div>
           <div class="list-of-content-header-item"><div >Figure 4: Direct emissions by source..................................................................................................................................................................................</div><div ><bdi>.....26</bdi></div> </div>
           <div class="list-of-content-header-item"><div >Figure 5: Indirect Emissions by sources .................................................................................................................................................................................</div><div ><bdi>.....28</bdi></div> </div>
           <div class="list-of-content-header-item"><div >Figure 6: Comparison of overall emissionsover the years..................................................................................................................................................................................................</div><div ><bdi>.....30</bdi></div> </div>
           <div class="list-of-content-header-item"><div >Figure 7: Comparison of direct emissions over the years ............................................................................................................................................................</div><div ><bdi>.....31</bdi></div> </div>
           <div class="list-of-content-header-item"><div >Figure 8: Comparison of Indirect emissions over the years ..................................................................................................................................................</div><div ><bdi>.....32</bdi></div> </div>
           <div class="list-of-content-header-item"><div >Figure 9: Comparison of per capita emission over the years ...............................................................................................................................................................</div><div ><bdi>.....33</bdi></div> </div>
           <div class="list-of-content-header-item"><div >Figure 10: Comparison of emission intensity over the years ............................................................................................................................................................</div><div ><bdi>.....34</bdi></div> </div>
           
         </div>
      
         
         </div>
         
         ${footer.replace("#pageNumber#",(pageNumber).toString())}
         
          </div>`



  return page_one;
    
  } 


async glossaryOfTerms(glossaryOfTerms: glossaryOfTerms,header,footer,inventryYear):Promise<string>{
  let pageNumber=8; 
   const glossaryOfTermsTable=glossaryOfTerms.glossaryOfTermsTable ;

  const page_one= ` <div id="page_8" class="page text-center" >
  ${header}
  <div class="content">
  <div class="table-header text-start">
  Glossary of terms
 </div>
<div class="report-table-sm">
             <figcaption class="figure-caption-table figure-caption text-start">Direct emissions for inventory year ${inventryYear}</figcaption>
             <table class="table  table-bordered border-dark">
               <thead class="table-primary  border-dark">
                 <tr>
                   <th scope="col">GHG emission source</th>
                   <th scope="col">Description</th>
                   
                 </tr>
               </thead>
               <tbody class="table-active">
               ${glossaryOfTermsTable.map((a: { title: string; description: string; })=>'<tr><td>'+a.title+'</td><td>'+a.description+'</td></tr>').join('')}
               </tbody>
             </table>
           </div>

  
  </div>
  
  ${footer.replace("#pageNumber#",(pageNumber).toString())}
  
   </div>`



    return page_one;
      
  }
async introduction(introductions: introduction,header,footer,companyName,baseYear,inventryYear):Promise<string>{


  let pageNumber=9; 
  const reportTimePeriod=introductions.reportTimePeriod;

const proposalNumber=introductions.proposalNumber;
const proposalDate=introductions.proposalDate;
const principle=introductions.principle;


  const page_one= ` <div id="page_9" class="page text-center" >
         ${header}
         <div class="content">
         <div  class="main_header text-start">1 INTRODUCTION</div>
                <blockquote class=" paragraph blockquote text-start ">
                  <p class="mb-0 lh-base">Global warming negatively affects the environment in different ways such
                     as degradation and loss of biodiversity,
                     melting of glaciers and sea level rise, extinction of species and cause a huge risk to human wellbeing. </p>
                </blockquote>
                <blockquote class=" paragraph blockquote text-start ">
                  <p class="mb-0 lh-base">Quantification of GHGs released by an industry or
                     organization is now appeared as the best practice to take the corrective actions to mitigate the adverse effects of climate change.
                     Quantification of Carbon footprint provides number of key benefits to the organization, among others, it:</p>
                </blockquote>

              <div class="list">  
                <ul>
                <li><blockquote class="blockquote  ">
                  <p class="mb-0 lh-base">Provides a good understanding on impacts on climate change;</p>
                </blockquote></li>
                <li><blockquote class="blockquote  ">
                  <p class="mb-0 lh-base">Develops key performance indicators for emission and energy management;</p>
                </blockquote></li>
                <li><blockquote class="blockquote  ">
                  <p class="mb-0 lh-base">Maintains a higher rank among other competitive industries showing its commitment towards sustainable business;</p>
                </blockquote></li>
                <li><blockquote class="blockquote  ">
                  <p class="mb-0 lh-base">Meets stakeholders demand to address the imperative corporate responsibility of environmental conservation; and</p>
                </blockquote></li>
                <li><blockquote class="blockquote  ">
                  <p class="mb-0 lh-base">Develops Carbon management plan to make real emission reduction through supply chain and production.</p>
                </blockquote></li>  
              </ul>
            </div>

            <blockquote class=" paragraph blockquote text-start ">
              <p class="mb-0 lh-base">The GHG Inventory Report (“the report”) quantifies and reports the 
                GHG emissions under the financial control of ${companyName}. 
                The report has been prepared and submitted in line with ${this.climateSIName}’s proposal number ${proposalNumber}, dated ${proposalDate} and various
                 discussions held between ${companyName} and ClimateSI.</p>
            </blockquote>
            <blockquote class=" paragraph blockquote text-start ">
              <p class="mb-0 lh-base">The time period of the report is from ${reportTimePeriod}. The organizational
                 Carbon footprint is calculated based on the activity data provided by ${companyName}.</p>
            </blockquote>
            <blockquote class=" paragraph blockquote text-start ">
            <p class="mb-0 lh-base">Principles of ${principle}
                were applied while quantifying and reporting the Greenhouse Gas (GHG) emissions.</p>
          </blockquote>
      
         
         </div>
         
         ${footer.replace("#pageNumber#",(pageNumber).toString())}
         
          </div>`

    const introduction=introductions.introduction;
    const responsible=introductions.responsible;
    const policy=introductions.policy;
    

  const page_two= ` <div id="page_10" class="page text-center" >
                     ${header}
                    <div class="content">
                    <div  class="main_header_sub text-start">1.1 Introduction to the organization</div>
                    <blockquote class=" paragraph blockquote text-start ">
                    <p class="mb-0 lh-base">${introduction}</p>
                  </blockquote>
                  <div  class="main_header_sub text-start">1.2 Persons responsible</div>
                  <blockquote class=" paragraph blockquote text-start ">
                  <p class="mb-0 lh-base">
                   ${responsible} 
                    </p>
                  </blockquote>
                  <div  class="main_header_sub text-start">1.3 Purpose of the report</div>
                  <blockquote class=" paragraph blockquote text-start ">
                  <p class="mb-0 lh-base">
                  This GHG Inventory quantifies the ${companyName}’s total GHG emissions for the IY ${inventryYear}, by accurately measuring 
                  the GHG emissions associated with its operations. The main purpose of this report is to figure out the 
                  amount of GHG emissions during the year. Also, this detail assessment helps the company to set the targets on 
                  GHG emissions and emission removal for the next inventory year or years to reduce their GHG emissions. 
                  This report will communicate the success of the efforts of ${companyName} to reduce the organizational GHG emissions to the internal and external stakeholders.          
                  </p>
                  </blockquote>

                  <div  class="main_header_sub text-start">1.4 Intended users</div>   
                  <blockquote class=" paragraph blockquote text-start ">
                  <p class="mb-0 lh-base">
                  The management team of ${companyName} may use the details of the report to make policy decisions which will 
                  lead the organization to a sustainable development pathway. Further, the employees and other 
                  stakeholders may use the details to identify their contribution to the organization carbon footprint and also
                  to take acltions to emissions reduction.        
                    </p>
                    </blockquote>  

                    <div  class="main_header_sub text-start">1.5 Dissemination policy</div>   
                    <blockquote class=" paragraph blockquote text-start ">
                    <p class="mb-0 lh-base">
                    ${policy}.     
                      </p>
                      </blockquote>  

  
                 </div>
  
                 ${footer.replace("#pageNumber#",(++pageNumber).toString())}
  
            </div>`



            const underbaseYear=introductions.underbaseYear;

            const page_three= ` <div id="page_11" class="page text-center" >
                   ${header}
                   <div class="content">
                   <div  class="main_header_sub text-start">1.6 Reporting period and frequency of reporting</div>   
               <blockquote class=" paragraph blockquote text-start ">
               <p class="mb-0 lh-base">
               This report quantifies the GHG emissions resulted in the inventory year ${reportTimePeriod}. The Bank will conduct
                the assessment annually as a best practice in moving towards sustainability.      
                 </p>
                 </blockquote>  
           
                 <div  class="main_header_sub text-start">1.7 Base year</div>   
              <blockquote class=" paragraph blockquote text-start ">
              <p class="mb-0 lh-base">
              This is ${underbaseYear}. Therefore, year ${baseYear} will be considered as the base year.      
                </p>
                </blockquote>  

                
               <div  class="main_header_sub text-start">1.8 Data and information (List of GHGs account)</div>   
               <blockquote class=" paragraph blockquote text-start ">
               <p class="mb-0 lh-base">
               Greenhouse Gas emissions assessment quantifies the total GHGs produced directly and 
               indirectly from an organization’s activities within a specified period. It quantifies 
               all seven greenhouse gases where applicable and measures in units of carbon dioxide equivalent, 
               or CO₂e. The seven gases are Carbon Dioxide (CO₂), Methane (CH₄) Nitrous Oxide (N₂O), 
               Hydrofluorocarbons (HFCs), Sulphur hexafluoride (SF₆), Perfluorocarbons (PFCs) and Nitrogen 
               Trifluoride (NF₃), which are identified by the Kyoto Protocol as most harmful gases that 
               have major impact on climate change and compulsory to report under ISO 14064-1:2018.      
                 </p>
                 </blockquote>  
                
                   
                   </div>
                   
                   ${footer.replace("#pageNumber#",(++pageNumber).toString())}
                   
                    </div>`



  return page_one+page_two+page_three;
    
  }

async boundries(boundries,header,footer,companyName):Promise<string>{



  let pageNumber=12; 


  const approach=boundries.approach;
  const approach_paragraph_1=boundries.approach_paragraph_1;
  const approach_paragraph_2=boundries.approach_paragraph_2;
 

  const page_one= ` <div id="page_12" class="page text-center" >
         ${header}
         <div class="content">
         <div  class="main_header text-start">2 BOUNDARIES</div>
         <blockquote class=" paragraph blockquote text-start ">
         <p class="mb-0 lh-base">
         The first step in calculation of carbon footprint is to set the boundary.
          This is important as it determines which sources and sinks of the organization
          must be included in the footprint calculation and which are to be excluded.     
           </p>
           </blockquote>  
     

           <div  class="main_header_sub text-start">2.1 Setting up the organizational boundaries</div>   
           <blockquote class=" paragraph blockquote text-start ">
           <p class="mb-0 lh-base">
           ISO 14064-1:2018 standard allows the setting of organizational boundaries on either 
           the control approach or the equity shareholding approach. According to the control 
           approach, all emissions and removals from the facilities over which it has financial 
           or operational control should be accounted. According to the shareholding approach, 
           emissions of the entities in which the 
           organization has a share must be counted in proportionate to the shareholding.      
             </p>
             </blockquote>  

             <div  class="main_header_sub_sub text-start">2.1.1 ${approach}</div>
             <blockquote class=" paragraph blockquote text-start ">
             <p class="mb-0 lh-base">
              ${approach_paragraph_1}.     
               </p>
               </blockquote>  
               <blockquote class=" paragraph blockquote text-start ">
             <p class="mb-0 lh-base">
              ${approach_paragraph_2}.     
               </p>
               </blockquote> 
               <div  class="main_header_sub text-start">2.2 Reporting boundaries</div>   
               <blockquote class=" paragraph blockquote text-start ">
               <p class="mb-0 lh-base">
               Under the reporting boundaries, organization shall establish and document the direct and indirect GHG emissions and
                removals associated with  its operations.    
                 </p>
                 </blockquote>  

              
      
         
         </div>
         
         ${footer.replace("#pageNumber#",(pageNumber).toString())}
         
          </div>`

const paragraph_2=boundries.paragraph_2;
const figure_2_link=boundries.figure_2_link;

          const page_two= ` <div id="page_13" class="page text-center" >
          ${header}
          <div class="content">
          <div  class="main_header_sub_sub text-start">2.2.1 Direct GHG emissions</div>
          <blockquote class=" paragraph blockquote text-start ">
          <p class="mb-0 lh-base">
          Direct GHG emissions are the emissions from the GHG sources owned or controlled by 
          the organization. Direct GHG emissions 
          should be quantified and reported separately for all GHGs in tCO₂e.     
            </p>
            </blockquote> 
            <div  class="main_header_sub_sub text-start">2.2.2 Indirect emissions</div>
            <blockquote class=" paragraph blockquote text-start ">
            <p class="mb-0 lh-base">
            Indirect emissions are those GHG emissions that occur as consequences of an organization’s 
            operations and activities, but arises from the GHG sources that are not owned or controlled 
            by the organization and quantified and reported separately for all GHGs in tCO₂e. 
            These indirect emissions have been selected according to the materiality to the company operations.
             Within the financial boundary of ${companyName}, the emissions associated with the following activities were quantified and reported. 
            ${paragraph_2}.     
              </p>
              </blockquote> 
              <blockquote class=" paragraph blockquote text-start ">
              <p class="mb-0 lh-base">
               Within the financial boundary of ${companyName}, the emissions associated with the following activities were quantified and reported.     
                </p>
                </blockquote> 
            
       
          
          </div>
          
          ${footer.replace("#pageNumber#",(++pageNumber).toString())}
          
           </div>`

           const direct_indirect_table=boundries.direct_indirect_table;

           const page_3= ` <div id="page_13_1" class="page text-center" >
           ${header}
           <div class="content">
           <div class="report-table-sm">
           <figcaption class="figure-caption-table figure-caption text-start">Direct and indirect emission sources used for quantifying GHG emissions. </figcaption>
           <table class="table  table-bordered border-dark">
             <thead class="table-primary  border-dark">
              
               <tr>
                 
                 <th scope="col">Direct Emissions</th>
                 <th scope="col">Indirect Emission</th>
                
                 
               </tr>
             </thead>
             <tbody class="table-active">
             ${direct_indirect_table
               .map(
                 (
                   a,
                   index_a
                 ) => `<tr><td >${a.direct.replace(/^\w/, (c: string) => c.toUpperCase())}</td><td>${a.indirect.replace(/^\w/, (c: string) => c.toUpperCase())}</td></tr>`
               )
               .join('')}
           
  
  
         
  
             </tbody>
           </table>
         </div>
        
           
           </div>
           
           ${footer.replace("#pageNumber#",(++pageNumber).toString())}
           
            </div>`

  return page_one+page_two+page_3;
    
  }

async quantification(quantification: any,header,footer,companyName,baseYear,inventryYear):Promise<string>{
  let pageNumber = 14;

  const consicitiveYear = quantification.consicitiveYear;
  const gwp = quantification.gwp;
  const paragraph_1 = quantification.paragraph_1;

  const page_1 = ` <div id="page_14" class="page text-center" >
         ${header}
         <div class="content">
         <div  class="main_header text-start">3 QUANTIFICATION OF GHG EMISSIONS AND REMOVALS</div>
         <blockquote class=" paragraph blockquote text-start ">
         <p class="mb-0 lh-base">
         This is ${consicitiveYear} for which the GHG emissions were quantified 
         in accordance with ISO 14064-1. This leads to a more complete reporting of ${companyName}’s GHG emissions.
          All GHG sources were identified in consultation with ${
            companyName
          }. The identified, categorized emission 
         sources are given in section 2.2 (“Reporting Boundaries”) of this report.    
           </p>
           </blockquote>  
     
           <div  class="main_header_sub text-start">3.1 Methodology</div>   
           <blockquote class=" paragraph blockquote text-start ">
           <p class="mb-0 lh-base">
           The main greenhouse gases attributed to the operations of the company are Carbon dioxide, Methane and Nitrous oxide. Carbon dioxide is associated with 
           electricity and fuel consumption. Methane and Nitrous oxide are formed in small quantities from the 
           combustion of diesel and petrol. As per International Protocol, all the greenhouse gases (GHGs) 
           are converted to carbon dioxide equivalent using global warming potentials (GWP) as ${gwp}. GHG reporting is done as Carbon Dioxide equivalent (CO₂e).   
             </p>
             </blockquote>  
             <blockquote class=" paragraph blockquote text-start ">
             <p class="mb-0 lh-base">
             All calculations were carried out based on activity data multiplied by appropriate GHG emission 
             factor. Unless stated otherwise, all emission factors were obtained from the Inter-governmental Panel on Climate Change (IPCC). This approach makes it easier to compare the
              carbon footprint calculated in this report with other similar reports.   
               </p>
               </blockquote>  
               <blockquote class=" paragraph blockquote text-start ">
               <p class="mb-0 lh-base">
              ${paragraph_1}. Then those were fed into the ‘Smart Carbon Calculator’ by the respective officers
                of ${companyName}. All these hard copies of GHG records will be kept at least for 2 years before archiving. Availability of the softcopy 
               has no time limit. To avoid the double counting data discrepancy patterns of changes were monitored. 
               When uncertainties arise, sample surveys were carried out to get the real image. 
                 </p>
                 </blockquote>  

                 <blockquote class=" paragraph blockquote text-start ">
                 <p class="mb-0 lh-base">
                 ${
                  companyName
                 } may decide to get the overall footprint verified by an independent 
                 third-party verification body and get the reasonable assurance
                  that its carbon footprint for the year ${
                    inventryYear
                  } is not materially misstated.
                   </p>
                   </blockquote>  


                   <blockquote class=" paragraph blockquote text-start ">
                   <p class="mb-0 lh-base">
                   Activity data used to assess the GHG emissions attributed to ${
                    companyName
                   } and the source of the data are given in the below table .
                     </p>
                     </blockquote>  


            
      
         
         </div>
         
         ${footer.replace('#pageNumber#', pageNumber.toString())}
         
          </div>`;

  const direct_emisions = quantification.direct_emisions;

  const page_2 = ` <div id="page_15" class="page text-center" >
         ${header}
         <div class="content">
         <div class="report-table-sm">
         <figcaption class="figure-caption-table figure-caption text-start">Activity data used for quantifying GHGs. </figcaption>
         <table class="table  table-bordered border-dark">
           <thead class="table-primary  border-dark">
             <tr>
               <th  rowspan="2"  scope="col">Emission source</th>
               <th  rowspan="2"  scope="col">ownership</th>
               <th  rowspan="2"  scope="col">Category 1</th>
               <th  rowspan="2"  scope="col">Category 2</th>
               <th  colspan="2"  scope="col">Activity Data</th>
               <th  rowspan="2" scope="col">Reference Data source</th>
               
               
             </tr>
             <tr>
               
               <th scope="col">Value</th>
               <th scope="col">Unit</th>
              
               
             </tr>
           </thead>
           <tbody class="table-active">
           ${direct_emisions
             .map(
               (
                 a: {
                   classification: any;
                   name: any;
                   noOfCat: number;
                   es: any;
                   quantity: any;
                   unit: any;
                   category1: any[];
                   numOfRow: any;
                 },
                 index_a: any,
               ) => {
                 if (a.classification.length == 0) {
                   return `<tr><td >${a.es}</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>`;
                 } else if (a.noOfCat == 0) {
                   return a.classification
                     .map((b, index_a) => {
                       if (index_a === 0) {
                         return `<tr><td rowspan="${a.numOfRow}">${a.es}</td><td>${b.name}</td><td>-</td><td>-</td><td>${b.quantity}</td><td>${b.unit}</td><td>${b.source}</td></tr>`;
                       } else {
                         return `<tr><td>${b.name}</td><td>-</td><td>-</td><td>${b.quantity}</td><td>${b.unit}</td><td>${b.source}</td></tr>`;
                       }
                     })
                     .join('');
                 } else {
                   return a.classification
                     .map((b, index_b) => {
                       return b.category1
                         .map((c, index_c) => {
                           if (c.category2 && c.category2 != 0) {
                             return c.category2
                               .map((d, index_d) => {
                                 if (
                                   index_b == 0 &&
                                   index_c == 0 &&
                                   index_d == 0
                                 ) {
                                   return `<tr><td rowspan="${a.numOfRow}">${a.es}</td><td rowspan="${b.numOfRow}">${b.name}</td><td rowspan="${c.category2.length}">${c.name}</td><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td><td>${b.source}</td></tr>`;
                                 } else if (index_c == 0 && index_d == 0) {
                                   return `<tr><td rowspan="${b.numOfRow}">${b.name}</td><td rowspan="${c.category2.length}">${c.name}</td><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td><td>${b.source}</td></tr>`;
                                 } else if (index_d == 0) {
                                   return `<tr><td rowspan="${c.category2.length}">${c.name}</td><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td><td>${b.source}</td></tr>`;
                                 } else {
                                   return `<tr><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td><td>${b.source}</td></tr>`;
                                 }
                               })
                               .join('');
                           } else {
                             if (index_b == 0 && index_c == 0) {
                               return `<tr><td rowspan="${a.numOfRow}">${a.es}</td><td rowspan="${b.numOfRow}">${b.name}</td><td >${c.name}</td><td>-</td><td>${c.quantity}</td><td>${c.unit}</td><td>${b.source}</td></tr>`;
                             } else if (index_c == 0) {
                               return `<tr><td rowspan="${b.numOfRow}">${b.name}</td><td >${c.name}</td><td>-</td><td>${c.quantity}</td><td>${c.unit}</td><td>${b.source}</td></tr>`;
                             } else {
                               return `<tr><td>${c.name}</td><td>-</td><td>${c.quantity}</td><td>${c.unit}</td><td>${b.source}</td></tr>`;
                             }
                           }
                         })
                         .join('');
                     })
                     .join('');
                 }
               },
             )
             .join('')}
         


       

           </tbody>
         </table>
       </div>
      
         
       
      
         
         </div>
         
         ${footer.replace('#pageNumber#', (++pageNumber).toString())}
         
          </div>`;

  const direct_emisions_2 = quantification.direct_emisions_2;
  const page_3 = !direct_emisions_2|| direct_emisions_2.length==0?'':` <div id="page_16" class="page text-center" >
          ${header}
          <div class="content">
          <div class="report-table-sm">
        
          <table class="table  table-bordered border-dark">
            <thead class="table-primary  border-dark">
              <tr>
                <th  rowspan="2"  scope="col">Emission source</th>
                <th  rowspan="2"  scope="col">ownership</th>
                <th  rowspan="2"  scope="col">Category 1</th>
                <th  rowspan="2"  scope="col">Category 2</th>
                <th  colspan="2"  scope="col">Activity Data</th>
                <th  rowspan="2" scope="col">Reference Data source</th>
                
                
              </tr>
              <tr>
                
                <th scope="col">Value</th>
                <th scope="col">Unit</th>
               
                
              </tr>
            </thead>
            <tbody class="table-active">
            ${direct_emisions_2
              .map(
                (
                  a: {
                    classification: any;
                    name: any;
                    noOfCat: number;
                    es: any;
                    quantity: any;
                    unit: any;
                    category1: any[];
                    numOfRow: any;
                  },
                  index_a: any,
                ) => {
                  if (a.classification.length == 0) {
                    return `<tr><td >${a.es}</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>`;
                  } else if (a.noOfCat == 0) {
                    return a.classification
                      .map((b, index_a) => {
                        if (index_a === 0) {
                          return `<tr><td rowspan="${a.numOfRow}">${a.es}</td><td>${b.name}</td><td>-</td><td>-</td><td>${b.quantity}</td><td>${b.unit}</td><td>${b.source}</td></tr>`;
                        } else {
                          return `<tr><td>${b.name}</td><td>-</td><td>-</td><td>${b.quantity}</td><td>${b.unit}</td><td>${b.source}</td></tr>`;
                        }
                      })
                      .join('');
                  } else {
                    return a.classification
                      .map((b, index_b) => {
                        return b.category1
                          .map((c, index_c) => {
                            if (c.category2 && c.category2 != 0) {
                              return c.category2
                                .map((d, index_d) => {
                                  if (
                                    index_b == 0 &&
                                    index_c == 0 &&
                                    index_d == 0
                                  ) {
                                    return `<tr><td rowspan="${a.numOfRow}">${a.es}</td><td rowspan="${b.numOfRow}">${b.name}</td><td rowspan="${c.category2.length}">${c.name}</td><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td><td rowspan="${b.numOfRow}">${b.source}</td></tr>`;
                                  } else if (index_c == 0 && index_d == 0) {
                                    return `<tr><td rowspan="${b.numOfRow}">${b.name}</td><td rowspan="${c.category2.length}">${c.name}</td><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td><td rowspan="${b.numOfRow}">${b.source}</td></tr>`;
                                  } else if (index_d == 0) {
                                    return `<tr><td rowspan="${c.category2.length}">${c.name}</td><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td></tr>`;
                                  } else {
                                    return `<tr><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td></tr>`;
                                  }
                                })
                                .join('');
                            } else {
                              if (index_b == 0 && index_c == 0) {
                                return `<tr><td rowspan="${a.numOfRow}">${a.es}</td><td rowspan="${b.numOfRow}">${b.name}</td><td >${c.name}</td><td>-</td><td>${c.quantity}</td><td>${c.unit}</td><td rowspan="${b.numOfRow}">${b.source}</td></tr>`;
                              } else if (index_c == 0) {
                                return `<tr><td rowspan="${b.numOfRow}">${b.name}</td><td >${c.name}</td><td>-</td><td>${c.quantity}</td><td>${c.unit}</td><td rowspan="${b.numOfRow}">${b.source}</td></tr>`;
                              } else {
                                return `<tr><td>${c.name}</td><td>-</td><td>${c.quantity}</td><td>${c.unit}</td></tr>`;
                              }
                            }
                          })
                          .join('');
                      })
                      .join('');
                  }
                },
              )
              .join('')}
          
 
 
        
 
            </tbody>
          </table>
        </div>
       
          
        
       
          
          </div>
          
          ${footer.replace('#pageNumber#', (++pageNumber).toString())}
          
           </div>`;

           const direct_emisions_3 = quantification.direct_emisions_3;
           const page_4 = !direct_emisions_3||direct_emisions_3.length==0?'':` <div id="page_17" class="page text-center" >
                   ${header}
                   <div class="content">
                   <div class="report-table-sm">
                 
                   <table class="table  table-bordered border-dark">
                     <thead class="table-primary  border-dark">
                       <tr>
                         <th  rowspan="2"  scope="col">Emission source</th>
                         <th  rowspan="2"  scope="col">ownership</th>
                         <th  rowspan="2"  scope="col">Category 1</th>
                         <th  rowspan="2"  scope="col">Category 2</th>
                         <th  colspan="2"  scope="col">Activity Data</th>
                         <th  rowspan="2" scope="col">Reference Data source</th>
                         
                         
                       </tr>
                       <tr>
                         
                         <th scope="col">Value</th>
                         <th scope="col">Unit</th>
                        
                         
                       </tr>
                     </thead>
                     <tbody class="table-active">
                     ${direct_emisions_3
                       .map(
                         (
                           a: {
                             classification: any;
                             name: any;
                             noOfCat: number;
                             es: any;
                             quantity: any;
                             unit: any;
                             category1: any[];
                             numOfRow: any;
                           },
                           index_a: any,
                         ) => {
                           if (a.classification.length == 0) {
                             return `<tr><td >${a.es}</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>`;
                           } else if (a.noOfCat == 0) {
                             return a.classification
                               .map((b, index_a) => {
                                 if (index_a === 0) {
                                   return `<tr><td rowspan="${a.numOfRow}">${a.es}</td><td>${b.name}</td><td>-</td><td>-</td><td>${b.quantity}</td><td>${b.unit}</td><td>${b.source}</td></tr>`;
                                 } else {
                                   return `<tr><td>${b.name}</td><td>-</td><td>-</td><td>${b.quantity}</td><td>${b.unit}</td><td>${b.source}</td></tr>`;
                                 }
                               })
                               .join('');
                           } else {
                             return a.classification
                               .map((b, index_b) => {
                                 return b.category1
                                   .map((c, index_c) => {
                                     if (c.category2 && c.category2 != 0) {
                                       return c.category2
                                         .map((d, index_d) => {
                                           if (
                                             index_b == 0 &&
                                             index_c == 0 &&
                                             index_d == 0
                                           ) {
                                             return `<tr><td rowspan="${a.numOfRow}">${a.es}</td><td rowspan="${b.numOfRow}">${b.name}</td><td rowspan="${c.category2.length}">${c.name}</td><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td><td rowspan="${b.numOfRow}">${b.source}</td></tr>`;
                                           } else if (index_c == 0 && index_d == 0) {
                                             return `<tr><td rowspan="${b.numOfRow}">${b.name}</td><td rowspan="${c.category2.length}">${c.name}</td><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td><td rowspan="${b.numOfRow}">${b.source}</td></tr>`;
                                           } else if (index_d == 0) {
                                             return `<tr><td rowspan="${c.category2.length}">${c.name}</td><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td></tr>`;
                                           } else {
                                             return `<tr><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td></tr>`;
                                           }
                                         })
                                         .join('');
                                     } else {
                                       if (index_b == 0 && index_c == 0) {
                                         return `<tr><td rowspan="${a.numOfRow}">${a.es}</td><td rowspan="${b.numOfRow}">${b.name}</td><td >${c.name}</td><td>-</td><td>${c.quantity}</td><td>${c.unit}</td><td rowspan="${b.numOfRow}">${b.source}</td></tr>`;
                                       } else if (index_c == 0) {
                                         return `<tr><td rowspan="${b.numOfRow}">${b.name}</td><td >${c.name}</td><td>-</td><td>${c.quantity}</td><td>${c.unit}</td><td rowspan="${b.numOfRow}">${b.source}</td></tr>`;
                                       } else {
                                         return `<tr><td>${c.name}</td><td>-</td><td>${c.quantity}</td><td>${c.unit}</td></tr>`;
                                       }
                                     }
                                   })
                                   .join('');
                               })
                               .join('');
                           }
                         },
                       )
                       .join('')}
                   
          
          
                 
          
                     </tbody>
                   </table>
                 </div>
                
                   
                 
                
                   
                   </div>
                   
                   ${footer.replace('#pageNumber#', (++pageNumber).toString())}
                   
                    </div>`;

                    const direct_emisions_4 = quantification.direct_emisions_4;
  const page_5 =!direct_emisions_4|| direct_emisions_4.length==0?'': ` <div id="page_18" class="page text-center" >
          ${header}
          <div class="content">
          <div class="report-table-sm">
        
          <table class="table  table-bordered border-dark">
            <thead class="table-primary  border-dark">
              <tr>
                <th  rowspan="2"  scope="col">Emission source</th>
                <th  rowspan="2"  scope="col">ownership</th>
                <th  rowspan="2"  scope="col">Category 1</th>
                <th  rowspan="2"  scope="col">Category 2</th>
                <th  colspan="2"  scope="col">Activity Data</th>
                <th  rowspan="2" scope="col">Reference Data source</th>
                
                
              </tr>
              <tr>
                
                <th scope="col">Value</th>
                <th scope="col">Unit</th>
               
                
              </tr>
            </thead>
            <tbody class="table-active">
            ${direct_emisions_4
              .map(
                (
                  a: {
                    classification: any;
                    name: any;
                    noOfCat: number;
                    es: any;
                    quantity: any;
                    unit: any;
                    category1: any[];
                    numOfRow: any;
                  },
                  index_a: any,
                ) => {
                  if (a.classification.length == 0) {
                    return `<tr><td >${a.es}</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>`;
                  } else if (a.noOfCat == 0) {
                    return a.classification
                      .map((b, index_a) => {
                        if (index_a === 0) {
                          return `<tr><td rowspan="${a.numOfRow}">${a.es}</td><td>${b.name}</td><td>-</td><td>-</td><td>${b.quantity}</td><td>${b.unit}</td><td>${b.source}</td></tr>`;
                        } else {
                          return `<tr><td>${b.name}</td><td>-</td><td>-</td><td>${b.quantity}</td><td>${b.unit}</td><td>${b.source}</td></tr>`;
                        }
                      })
                      .join('');
                  } else {
                    return a.classification
                      .map((b, index_b) => {
                        return b.category1
                          .map((c, index_c) => {
                            if (c.category2 && c.category2 != 0) {
                              return c.category2
                                .map((d, index_d) => {
                                  if (
                                    index_b == 0 &&
                                    index_c == 0 &&
                                    index_d == 0
                                  ) {
                                    return `<tr><td rowspan="${a.numOfRow}">${a.es}</td><td rowspan="${b.numOfRow}">${b.name}</td><td rowspan="${c.category2.length}">${c.name}</td><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td><td rowspan="${b.numOfRow}">${b.source}</td></tr>`;
                                  } else if (index_c == 0 && index_d == 0) {
                                    return `<tr><td rowspan="${b.numOfRow}">${b.name}</td><td rowspan="${c.category2.length}">${c.name}</td><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td><td rowspan="${b.numOfRow}">${b.source}</td></tr>`;
                                  } else if (index_d == 0) {
                                    return `<tr><td rowspan="${c.category2.length}">${c.name}</td><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td></tr>`;
                                  } else {
                                    return `<tr><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td></tr>`;
                                  }
                                })
                                .join('');
                            } else {
                              if (index_b == 0 && index_c == 0) {
                                return `<tr><td rowspan="${a.numOfRow}">${a.es}</td><td rowspan="${b.numOfRow}">${b.name}</td><td >${c.name}</td><td>-</td><td>${c.quantity}</td><td>${c.unit}</td><td rowspan="${b.numOfRow}">${b.source}</td></tr>`;
                              } else if (index_c == 0) {
                                return `<tr><td rowspan="${b.numOfRow}">${b.name}</td><td >${c.name}</td><td>-</td><td>${c.quantity}</td><td>${c.unit}</td><td rowspan="${b.numOfRow}">${b.source}</td></tr>`;
                              } else {
                                return `<tr><td>${c.name}</td><td>-</td><td>${c.quantity}</td><td>${c.unit}</td></tr>`;
                              }
                            }
                          })
                          .join('');
                      })
                      .join('');
                  }
                },
              )
              .join('')}
          
 
 
        
 
            </tbody>
          </table>
        </div>
       
          
        
       
          
          </div>
          
          ${footer.replace('#pageNumber#', (++pageNumber).toString())}
          
           </div>`;


           const direct_emisions_5 = quantification.direct_emisions_5;
  const page_6 =!direct_emisions_5|| direct_emisions_5.length==0?'':  ` <div id="page_19" class="page text-center" >
          ${header}
          <div class="content">
          <div class="report-table-sm">
        
          <table class="table  table-bordered border-dark">
            <thead class="table-primary  border-dark">
              <tr>
                <th  rowspan="2"  scope="col">Emission source</th>
                <th  rowspan="2"  scope="col">ownership</th>
                <th  rowspan="2"  scope="col">Category 1</th>
                <th  rowspan="2"  scope="col">Category 2</th>
                <th  colspan="2"  scope="col">Activity Data</th>
                <th  rowspan="2" scope="col">Reference Data source</th>
                
                
              </tr>
              <tr>
                
                <th scope="col">Value</th>
                <th scope="col">Unit</th>
               
                
              </tr>
            </thead>
            <tbody class="table-active">
            ${direct_emisions_5
              .map(
                (
                  a: {
                    classification: any;
                    name: any;
                    noOfCat: number;
                    es: any;
                    quantity: any;
                    unit: any;
                    category1: any[];
                    numOfRow: any;
                  },
                  index_a: any,
                ) => {
                  if (a.classification.length == 0) {
                    return `<tr><td >${a.es}</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>`;
                  } else if (a.noOfCat == 0) {
                    return a.classification
                      .map((b, index_a) => {
                        if (index_a === 0) {
                          return `<tr><td rowspan="${a.numOfRow}">${a.es}</td><td>${b.name}</td><td>-</td><td>-</td><td>${b.quantity}</td><td>${b.unit}</td><td>${b.source}</td></tr>`;
                        } else {
                          return `<tr><td>${b.name}</td><td>-</td><td>-</td><td>${b.quantity}</td><td>${b.unit}</td><td>${b.source}</td></tr>`;
                        }
                      })
                      .join('');
                  } else {
                    return a.classification
                      .map((b, index_b) => {
                        return b.category1
                          .map((c, index_c) => {
                            if (c.category2 && c.category2 != 0) {
                              return c.category2
                                .map((d, index_d) => {
                                  if (
                                    index_b == 0 &&
                                    index_c == 0 &&
                                    index_d == 0
                                  ) {
                                    return `<tr><td rowspan="${a.numOfRow}">${a.es}</td><td rowspan="${b.numOfRow}">${b.name}</td><td rowspan="${c.category2.length}">${c.name}</td><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td><td rowspan="${b.numOfRow}">${b.source}</td></tr>`;
                                  } else if (index_c == 0 && index_d == 0) {
                                    return `<tr><td rowspan="${b.numOfRow}">${b.name}</td><td rowspan="${c.category2.length}">${c.name}</td><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td><td rowspan="${b.numOfRow}">${b.source}</td></tr>`;
                                  } else if (index_d == 0) {
                                    return `<tr><td rowspan="${c.category2.length}">${c.name}</td><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td></tr>`;
                                  } else {
                                    return `<tr><td>${d.name}</td><td>${d.quantity}</td><td>${d.unit}</td></tr>`;
                                  }
                                })
                                .join('');
                            } else {
                              if (index_b == 0 && index_c == 0) {
                                return `<tr><td rowspan="${a.numOfRow}">${a.es}</td><td rowspan="${b.numOfRow}">${b.name}</td><td >${c.name}</td><td>-</td><td>${c.quantity}</td><td>${c.unit}</td><td rowspan="${b.numOfRow}">${b.source}</td></tr>`;
                              } else if (index_c == 0) {
                                return `<tr><td rowspan="${b.numOfRow}">${b.name}</td><td >${c.name}</td><td>-</td><td>${c.quantity}</td><td>${c.unit}</td><td rowspan="${b.numOfRow}">${b.source}</td></tr>`;
                              } else {
                                return `<tr><td>${c.name}</td><td>-</td><td>${c.quantity}</td><td>${c.unit}</td></tr>`;
                              }
                            }
                          })
                          .join('');
                      })
                      .join('');
                  }
                },
              )
              .join('')}
          
 
 
        
 
            </tbody>
          </table>
        </div>
       
          
        
       
          
          </div>
          
          ${footer.replace('#pageNumber#', (++pageNumber).toString())}
          
           </div>`;


  

  const defra = quantification.defra;
  const page_7 = ` <div id="page_20" class="page text-center" >
          ${header}
          <div class="content">
          <div  class="main_header_sub text-start">3.2 Emission factors and other constants</div>

          <blockquote class=" paragraph blockquote text-start ">
            <p class="mb-0 lh-base">Emission factors, unit cost, fuel economy values used in the calculation
             of GHG emissions attributed to different emission sources are given in below table </p>
          </blockquote>
          <div class="report-table-sm">
          <figcaption class="figure-caption-table figure-caption text-start">Emission Factors and other constants used for emission source: defra
          </figcaption>
          <table class="table  table-bordered border-dark">
            <thead class="table-primary  border-dark">
              <tr>
             
              <tr>
                <th  rowspan="2"  scope="col">Emission source</th>
                <th  rowspan="2"  scope="col">Category</th>
                <th  rowspan="2"  scope="col">Sub Category</th>
                <th  colspan="2"  scope="col">Factor/Constant</th>
                <th  rowspan="2" scope="col">Reference Data source</th>
                
                
              </tr>
              <tr>
                
                <th scope="col">Value</th>
                <th scope="col">Unit</th>
               
                
              </tr>
            </thead>
            <tbody class="table-active">
            ${
              defra
                .map((a, index_a: number) => {
                  if (a.category1.length == 0) {
                    return ` <tr><td>${a.es}</td> <td>-</td> <td>-</td> <td>-</td> <td>-</td><td>-</td></tr>`;
                  } else {
                    return a.category1
                      .map((b, index_b) => {
                        if (b.subcat && b.subcat.subcat != 0) {
                          return b.subcat
                            .map((c, index_c) => {
                              if (index_b == 0 && index_c == 0) {
                                return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td> <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                              } else if (index_c == 0) {
                                return ` <tr> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                              } else {
                                return ` <tr>  <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                              }
                            })
                            .join('');
                        } else {
                          if (index_b == 0) {
                            return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>-</td></tr>`;
                          } else {
                            return ` <tr> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>-</td></tr>`;
                          }
                        }
                      })
                      .join('');
                  }
                })
                .join('')

              //   emission_factors_Stationary.map((a: { noOfCat: number; es: any; quantity: any; unit: any; category1: any[]; numOfRow: any; },index_a: any)=>{
              //   if(a.noOfCat==0){

              //    return `<tr><td  >${a.es}</td><td>-</td><td>${a.quantity}</td><td>${a.unit}</td><td>Central Accounts of the Bank</td></tr>`;
              //   }else{
              //    if(a.category1.length==0){
              //      return `<tr><td  >${a.es}</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>`;
              //    }else{

              //      return a.category1.map((b: { category2: any[]; name: any; quantity: any; unit: any; },index_b: number)=>{

              //          if(index_b==0){
              //            return `<tr><td rowspan="${a.numOfRow}"  >${a.es}</td><td>${b.name}</td><td>${b.quantity?b.quantity:"-"}</td><td>${b.unit?b.unit:"-"}</td><td>-</td></tr>`;

              //          }else{
              //            return `<tr><td>${b.name}</td><td>${b.quantity?b.quantity:"-"}</td><td>${b.unit?b.unit:"-"}</td><td>-</td></tr>`;

              //          }

              //      }).join('');
              //    }

              //   }

              // }).join('')
            }
     
            </tbody>
          </table>
        </div>
       
          
          </div>
          
          ${footer.replace('#pageNumber#', (++pageNumber).toString())}
          
           </div>`;

           const defra_2 = quantification.defra_2;
           const page_8 =!defra_2|| defra_2.length==0?'': ` <div id="page_21" class="page text-center" >
                   ${header}
                   <div class="content">
                   
                   <div class="report-table-sm">
                  
                   <table class="table  table-bordered border-dark">
                     <thead class="table-primary  border-dark">
                       <tr>
                      
                       <tr>
                         <th  rowspan="2"  scope="col">Emission source</th>
                         <th  rowspan="2"  scope="col">Category</th>
                         <th  rowspan="2"  scope="col">Sub Category</th>
                         <th  colspan="2"  scope="col">Factor/Constant</th>
                         <th  rowspan="2" scope="col">Reference Data source</th>
                         
                         
                       </tr>
                       <tr>
                         
                         <th scope="col">Value</th>
                         <th scope="col">Unit</th>
                        
                         
                       </tr>
                     </thead>
                     <tbody class="table-active">
                     ${
                      defra_2
                         .map((a, index_a: number) => {
                           if (a.category1.length == 0) {
                             return ` <tr><td>${a.es}</td> <td>-</td> <td>-</td> <td>-</td> <td>-</td><td>-</td></tr>`;
                           } else {
                             return a.category1
                               .map((b, index_b) => {
                                 if (b.subcat && b.subcat.subcat != 0) {
                                   return b.subcat
                                     .map((c, index_c) => {
                                       if (index_b == 0 && index_c == 0) {
                                         return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td> <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                                       } else if (index_c == 0) {
                                         return ` <tr> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                                       } else {
                                         return ` <tr>  <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                                       }
                                     })
                                     .join('');
                                 } else {
                                   if (index_b == 0) {
                                     return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>-</td></tr>`;
                                   } else {
                                     return ` <tr> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>-</td></tr>`;
                                   }
                                 }
                               })
                               .join('');
                           }
                         })
                         .join('')
         

         
                   
                     }
              
                     </tbody>
                   </table>
                 </div>
                
                   
                   </div>
                   
                   ${footer.replace('#pageNumber#', (++pageNumber).toString())}
                   
                    </div>`;

  const fuelFactor = quantification.fuelFactor;
  const page_9 =!fuelFactor|| fuelFactor.length==0?'': ` <div id="page_22" class="page text-center" >
         ${header}
         <div class="content">
         <div class="report-table-sm">
         <figcaption class="figure-caption-table figure-caption text-start">Emission Factors and other constants used for emission source: Fuel Factor </figcaption>
         <table class="table  table-bordered border-dark">
         <thead class="table-primary  border-dark">
         
         <tr>
         <th  rowspan="2"  scope="col">Emission source</th>
         <th  rowspan="2"  scope="col">Category</th>
         <th  rowspan="2"  scope="col">Sub Category</th>
         <th  colspan="2"  scope="col">Factor/Constant</th>
         <th  rowspan="2" scope="col">Reference Data source</th>
         
         
       </tr>
       <tr>
         
         <th scope="col">Value</th>
         <th scope="col">Unit</th>
        
         
       </tr>
       </thead>
       <tbody class="table-active">
       ${fuelFactor
         .map((a, index_a: number) => {
           if (a.category1.length == 0) {
             return ` <tr><td>${a.es}</td> <td>-</td> <td>-</td> <td>-</td> <td>-</td><td>-</td></tr>`;
           } else {
             return a.category1
               .map((b, index_b) => {
                 if (b.subcat && b.subcat.subcat != 0) {
                   return b.subcat
                     .map((c, index_c) => {
                       if (index_b == 0 && index_c == 0) {
                         return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td> <td>${c.quantity}</td> <td>${c.unit}</td><td>${c.source}</td></tr>`;
                       } else if (index_c == 0) {
                         return ` <tr> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>${c.source}</td></tr>`;
                       } else {
                         return ` <tr>  <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>${c.source}</td></tr>`;
                       }
                     })
                     .join('');
                 } else {
                   if (index_b == 0) {
                     return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>${b.source}</td></tr>`;
                   } else {
                     return ` <tr> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>${b.source}</td></tr>`;
                   }
                 }
               })
               .join('');
           }
         })
         .join('')}

       </tbody>
     
         
         </table>
    
         </div>
      
  
      
         
         </div>
         
         ${footer.replace('#pageNumber#', (++pageNumber).toString())}
         
          </div>`;



          const fuelFactor_2 = quantification.fuelFactor_2;
          const page_10=!fuelFactor_2|| fuelFactor_2.length==0?'': ` <div id="page_23" class="page text-center" >
                 ${header}
                 <div class="content">
                 <div class="report-table-sm">
                 <table class="table  table-bordered border-dark">
                 <thead class="table-primary  border-dark">
                 
                 <tr>
                 <th  rowspan="2"  scope="col">Emission source</th>
                 <th  rowspan="2"  scope="col">Category</th>
                 <th  rowspan="2"  scope="col">Sub Category</th>
                 <th  colspan="2"  scope="col">Factor/Constant</th>
                 <th  rowspan="2" scope="col">Reference Data source</th>
                 
                 
               </tr>
               <tr>
                 
                 <th scope="col">Value</th>
                 <th scope="col">Unit</th>
                
                 
               </tr>
               </thead>
               <tbody class="table-active">
               ${fuelFactor_2
                 .map((a, index_a: number) => {
                   if (a.category1.length == 0) {
                     return ` <tr><td>${a.es}</td> <td>-</td> <td>-</td> <td>-</td> <td>-</td><td>-</td></tr>`;
                   } else {
                     return a.category1
                       .map((b, index_b) => {
                         if (b.subcat && b.subcat.subcat != 0) {
                           return b.subcat
                             .map((c, index_c) => {
                               if (index_b == 0 && index_c == 0) {
                                 return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td> <td>${c.quantity}</td> <td>${c.unit}</td><td>${c.source}</td></tr>`;
                               } else if (index_c == 0) {
                                 return ` <tr> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>${c.source}</td></tr>`;
                               } else {
                                 return ` <tr>  <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                               }
                             })
                             .join('');
                         } else {
                           if (index_b == 0) {
                             return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>${b.source}</td></tr>`;
                           } else {
                             return ` <tr> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>${b.source}</td></tr>`;
                           }
                         }
                       })
                       .join('');
                   }
                 })
                 .join('')}
        
               </tbody>
             
                 
                 </table>
            
                 </div>
              
          
              
                 
                 </div>
                 
                 ${footer.replace('#pageNumber#', (++pageNumber).toString())}
                 
                  </div>`;
  const fuelSpecific = quantification.fuelSpecific;
  const page_11 = !fuelSpecific|| fuelSpecific.length==0?'':` <div id="page_24" class="page text-center" >
        ${header}
        <div class="content">
        <div class="report-table-sm">
        <figcaption class="figure-caption-table figure-caption text-start">Emission Factors and other constants used for emission source: Fuel Specific</figcaption>
        <table class="table  table-bordered border-dark">
        <thead class="table-primary  border-dark">
        
        <tr>
        <th  rowspan="2"  scope="col">Emission source</th>
        <th  rowspan="2"  scope="col">Category</th>
        <th  rowspan="2"  scope="col">Sub Category</th>
        <th  colspan="2"  scope="col">Factor/Constant</th>
        <th  rowspan="2" scope="col">Reference Data source</th>
        
        
      </tr>
      <tr>
        
        <th scope="col">Value</th>
        <th scope="col">Unit</th>
       
        
      </tr>
      </thead>
      <tbody class="table-active">
      ${fuelSpecific
        .map((a, index_a: number) => {
          if (a.category1.length == 0) {
            return ` <tr><td>${a.es}</td> <td>-</td> <td>-</td> <td>-</td> <td>-</td><td>-</td></tr>`;
          } else {
            return a.category1
              .map((b, index_b) => {
                if (b.subcat && b.subcat.subcat != 0) {
                  return b.subcat
                    .map((c, index_c) => {
                      if (index_b == 0 && index_c == 0) {
                        return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td> <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                      } else if (index_c == 0) {
                        return ` <tr> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                      } else {
                        return ` <tr>  <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                      }
                    })
                    .join('');
                } else {
                  if (index_b == 0) {
                    return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>-</td></tr>`;
                  } else {
                    return ` <tr> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>-</td></tr>`;
                  }
                }
              })
              .join('');
          }
        })
        .join('')}

      </tbody>
    
        
        </table>
   
        </div>
     
 
     
        
        </div>
        
        ${footer.replace('#pageNumber#', (++pageNumber).toString())}
        
         </div>`;
         const gwp_table = quantification.gwp_table;
         const page_12=!gwp_table|| gwp_table.length==0?'': ` <div id="page_25" class="page text-center" >
              ${header}
              <div class="content">
              <div class="report-table-sm">
              <figcaption class="figure-caption-table figure-caption text-start">Emission Factors and other constants used for emission source: GWP</figcaption>
              <table class="table  table-bordered border-dark">
              <thead class="table-primary  border-dark">
              
              <tr>
              <th   scope="col">Emission source</th>
              <th    scope="col">value</th>
              <th    scope="col">unit</th>
              <th   scope="col">source</th>
    
             
              
              
            </tr>
           
            </thead>
            <tbody class="table-active">
            ${gwp_table
              .map((a, index_a: number) => ` <tr><td>${a.name}</td> <td>${a.value}</td> <td>${a.unit ? a.unit : '-'}</td> <td>${a.reference ? a.reference: '-'}</td></tr>`)
              .join('')}
       
            </tbody>
          
              
              </table>
         
              </div>
           
       
           
              
              </div>
              
              ${footer.replace('#pageNumber#', (++pageNumber).toString())}
              
               </div>`;

  const common = quantification.common;
  const page_13 =!common|| common.length==0?'': ` <div id="page_26" class="page text-center" >
       ${header}
       <div class="content">
       <div class="report-table-sm">
       <figcaption class="figure-caption-table figure-caption text-start">Emission Factors and other constants used for emission source: Common</figcaption>
       <table class="table  table-bordered border-dark">
       <thead class="table-primary  border-dark">
       
       <tr>
       <th  rowspan="2"  scope="col">Emission source</th>
       <th  rowspan="2"  scope="col">Category</th>
       <th  rowspan="2"  scope="col">Sub Category</th>
       <th  colspan="2"  scope="col">Factor/Constant</th>
       <th  rowspan="2" scope="col">Reference Data source</th>
       
       
     </tr>
     <tr>
       
       <th scope="col">Value</th>
       <th scope="col">Unit</th>
      
       
     </tr>
     </thead>
     <tbody class="table-active">
     ${common
       .map((a, index_a: number) => {
         if (a.category1.length == 0) {
           return ` <tr><td>${a.es}</td> <td>-</td> <td>-</td> <td>-</td> <td>-</td><td>-</td></tr>`;
         } else {
           return a.category1
             .map((b, index_b) => {
               if (b.subcat && b.subcat.subcat != 0) {
                 return b.subcat
                   .map((c, index_c) => {
                     if (index_b == 0 && index_c == 0) {
                       return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td> <td>${c.quantity}</td> <td>${c.unit}</td><td>${c.source}</td></tr>`;
                     } else if (index_c == 0) {
                       return ` <tr> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>${c.source}</td></tr>`;
                     } else {
                       return ` <tr>  <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                     }
                   })
                   .join('');
               } else {
                 if (index_b == 0) {
                   return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>${b.source}</td></tr>`;
                 } else {
                   return ` <tr> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>${b.source}</td></tr>`;
                 }
               }
             })
             .join('');
         }
       })
       .join('')}

     </tbody>
   
       
       </table>
  
       </div>
    

    
       
       </div>
       
       ${footer.replace('#pageNumber#', (++pageNumber).toString())}
       
        </div>`;

        const common_2 = quantification.common_2;
        const page_14 =!common_2|| common_2.length==0?'':  ` <div id="page_27" class="page text-center" >
             ${header}
             <div class="content">
             <div class="report-table-sm">
             <table class="table  table-bordered border-dark">
             <thead class="table-primary  border-dark">
             
             <tr>
             <th  rowspan="2"  scope="col">Emission source</th>
             <th  rowspan="2"  scope="col">Category</th>
             <th  rowspan="2"  scope="col">Sub Category</th>
             <th  colspan="2"  scope="col">Factor/Constant</th>
             <th  rowspan="2" scope="col">Reference Data source</th>
             
             
           </tr>
           <tr>
             
             <th scope="col">Value</th>
             <th scope="col">Unit</th>
            
             
           </tr>
           </thead>
           <tbody class="table-active">
           ${common_2
             .map((a, index_a: number) => {
               if (a.category1.length == 0) {
                 return ` <tr><td>${a.es}</td> <td>-</td> <td>-</td> <td>-</td> <td>-</td><td>-</td></tr>`;
               } else {
                 return a.category1
                   .map((b, index_b) => {
                     if (b.subcat && b.subcat.subcat != 0) {
                       return b.subcat
                         .map((c, index_c) => {
                           if (index_b == 0 && index_c == 0) {
                             return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td> <td>${c.quantity}</td> <td>${c.unit}</td><td>${c.source}</td></tr>`;
                           } else if (index_c == 0) {
                             return ` <tr> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>${c.source}</td></tr>`;
                           } else {
                             return ` <tr>  <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                           }
                         })
                         .join('');
                     } else {
                       if (index_b == 0) {
                         return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>${b.source}</td></tr>`;
                       } else {
                         return ` <tr> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>${b.source}</td></tr>`;
                       }
                     }
                   })
                   .join('');
               }
             })
             .join('')}
      
           </tbody>
         
             
             </table>
        
             </div>
          
      
          
             
             </div>
             
             ${footer.replace('#pageNumber#', (++pageNumber).toString())}
             
              </div>`;

              const common_3 = quantification.common_3;
              const page_15 =!common_3|| common_3.length==0?'':  ` <div id="page_28" class="page text-center" >
                   ${header}
                   <div class="content">
                   <div class="report-table-sm">
                   <table class="table  table-bordered border-dark">
                   <thead class="table-primary  border-dark">
                   
                   <tr>
                   <th  rowspan="2"  scope="col">Emission source</th>
                   <th  rowspan="2"  scope="col">Category</th>
                   <th  rowspan="2"  scope="col">Sub Category</th>
                   <th  colspan="2"  scope="col">Factor/Constant</th>
                   <th  rowspan="2" scope="col">Reference Data source</th>
                   
                   
                 </tr>
                 <tr>
                   
                   <th scope="col">Value</th>
                   <th scope="col">Unit</th>
                  
                   
                 </tr>
                 </thead>
                 <tbody class="table-active">
                 ${common_3
                   .map((a, index_a: number) => {
                     if (a.category1.length == 0) {
                       return ` <tr><td>${a.es}</td> <td>-</td> <td>-</td> <td>-</td> <td>-</td><td>-</td></tr>`;
                     } else {
                       return a.category1
                         .map((b, index_b) => {
                           if (b.subcat && b.subcat.subcat != 0) {
                             return b.subcat
                               .map((c, index_c) => {
                                 if (index_b == 0 && index_c == 0) {
                                   return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td> <td>${c.quantity}</td> <td>${c.unit}</td><td>${c.source}</td></tr>`;
                                 } else if (index_c == 0) {
                                   return ` <tr> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>${c.source}</td></tr>`;
                                 } else {
                                   return ` <tr>  <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                                 }
                               })
                               .join('');
                           } else {
                             if (index_b == 0) {
                               return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>${b.source}</td></tr>`;
                             } else {
                               return ` <tr> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>${b.source}</td></tr>`;
                             }
                           }
                         })
                         .join('');
                     }
                   })
                   .join('')}
            
                 </tbody>
               
                   
                   </table>
              
                   </div>
                
            
                
                   
                   </div>
                   
                   ${footer.replace('#pageNumber#', (++pageNumber).toString())}
                   
                    </div>`;

 
  const transport = quantification.transport;
  const page_16 =!transport|| transport.length==0?'': ` <div id="page_29" class="page text-center" >
      ${header}
      <div class="content">
      <div class="report-table-sm">
      <figcaption class="figure-caption-table figure-caption text-start">Emission Factors and other constants used for emission source: transport</figcaption>
      <table class="table  table-bordered border-dark">
      <thead class="table-primary  border-dark">
      
      <tr>
      <th  rowspan="2"  scope="col">Emission source</th>
      <th  rowspan="2"  scope="col">Category</th>
      <th  rowspan="2"  scope="col">Sub Category</th>
      <th  colspan="2"  scope="col">Factor/Constant</th>
      <th  rowspan="2" scope="col">Reference Data source</th>
      
      
    </tr>
    <tr>
      
      <th scope="col">Value</th>
      <th scope="col">Unit</th>
     
      
    </tr>
    </thead>
    <tbody class="table-active">
    ${transport
      .map((a, index_a: number) => {
        if (a.category1.length == 0) {
          return ` <tr><td>${a.es}</td> <td>-</td> <td>-</td> <td>-</td> <td>-</td><td>-</td></tr>`;
        } else {
          return a.category1
            .map((b, index_b) => {
              if (b.subcat && b.subcat.subcat != 0) {
                return b.subcat
                  .map((c, index_c) => {
                    if (index_b == 0 && index_c == 0) {
                      return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td> <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                    } else if (index_c == 0) {
                      return ` <tr> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                    } else {
                      return ` <tr>  <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                    }
                  })
                  .join('');
              } else {
                if (index_b == 0) {
                  return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>-</td></tr>`;
                } else {
                  return ` <tr> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>-</td></tr>`;
                }
              }
            })
            .join('');
        }
      })
      .join('')}

    </tbody>
  
      
      </table>
 
      </div>
   

   
      
      </div>
      
      ${footer.replace('#pageNumber#', (++pageNumber).toString())}
      
       </div>`;

  const freightwater = quantification.freightwater;
  const page_17 =!freightwater|| freightwater.length==0?'': ` <div id="page_30" class="page text-center" >
     ${header}
     <div class="content">
     <div class="report-table-sm">
     <figcaption class="figure-caption-table figure-caption text-start">Emission Factors and other constants used for emission source: freight water</figcaption>
     <table class="table  table-bordered border-dark">
     <thead class="table-primary  border-dark">
     
     <tr>
     <th  rowspan="2"  scope="col">Emission source</th>
     <th  rowspan="2"  scope="col">Category</th>
     <th  rowspan="2"  scope="col">Sub Category</th>
     <th  colspan="2"  scope="col">Factor/Constant</th>
     <th  rowspan="2" scope="col">Reference Data source</th>
     
     
   </tr>
   <tr>
     
     <th scope="col">Value</th>
     <th scope="col">Unit</th>
    
     
   </tr>
   </thead>
   <tbody class="table-active">
   ${freightwater
     .map((a, index_a: number) => {
       if (a.category1.length == 0) {
         return ` <tr><td>${a.es}</td> <td>-</td> <td>-</td> <td>-</td> <td>-</td><td>-</td></tr>`;
       } else {
         return a.category1
           .map((b, index_b) => {
             if (b.subcat && b.subcat.subcat != 0) {
               return b.subcat
                 .map((c, index_c) => {
                   if (index_b == 0 && index_c == 0) {
                     return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td> <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                   } else if (index_c == 0) {
                     return ` <tr> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                   } else {
                     return ` <tr>  <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                   }
                 })
                 .join('');
             } else {
               if (index_b == 0) {
                 return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>-</td></tr>`;
               } else {
                 return ` <tr> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>-</td></tr>`;
               }
             }
           })
           .join('');
       }
     })
     .join('')}

   </tbody>
 
     
     </table>

     </div>
  

  
     
     </div>
     
     ${footer.replace('#pageNumber#', (++pageNumber).toString())}
     
      </div>`;
      const freightwater_2 = quantification.freightwater_2;
      const page_18 =!freightwater_2|| freightwater_2.length==0?'': ` <div id="page_31" class="page text-center" >
         ${header}
         <div class="content">
         <div class="report-table-sm">
         <table class="table  table-bordered border-dark">
         <thead class="table-primary  border-dark">
         
         <tr>
         <th  rowspan="2"  scope="col">Emission source</th>
         <th  rowspan="2"  scope="col">Category</th>
         <th  rowspan="2"  scope="col">Sub Category</th>
         <th  colspan="2"  scope="col">Factor/Constant</th>
         <th  rowspan="2" scope="col">Reference Data source</th>
         
         
       </tr>
       <tr>
         
         <th scope="col">Value</th>
         <th scope="col">Unit</th>
        
         
       </tr>
       </thead>
       <tbody class="table-active">
       ${freightwater_2
         .map((a, index_a: number) => {
           if (a.category1.length == 0) {
             return ` <tr><td>${a.es}</td> <td>-</td> <td>-</td> <td>-</td> <td>-</td><td>-</td></tr>`;
           } else {
             return a.category1
               .map((b, index_b) => {
                 if (b.subcat && b.subcat.subcat != 0) {
                   return b.subcat
                     .map((c, index_c) => {
                       if (index_b == 0 && index_c == 0) {
                         return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td> <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                       } else if (index_c == 0) {
                         return ` <tr> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                       } else {
                         return ` <tr>  <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                       }
                     })
                     .join('');
                 } else {
                   if (index_b == 0) {
                     return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>-</td></tr>`;
                   } else {
                     return ` <tr> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>-</td></tr>`;
                   }
                 }
               })
               .join('');
           }
         })
         .join('')}
    
       </tbody>
     
         
         </table>
    
         </div>
      
    
      
         
         </div>
         
         ${footer.replace('#pageNumber#', (++pageNumber).toString())}
         
          </div>`;

          const freightwater_3 = quantification.freightwater_3;
  const page_19 =!freightwater_3|| freightwater_3.length==0?'': ` <div id="page_32" class="page text-center" >
     ${header}
     <div class="content">
     <div class="report-table-sm">
     <table class="table  table-bordered border-dark">
     <thead class="table-primary  border-dark">
     
     <tr>
     <th  rowspan="2"  scope="col">Emission source</th>
     <th  rowspan="2"  scope="col">Category</th>
     <th  rowspan="2"  scope="col">Sub Category</th>
     <th  colspan="2"  scope="col">Factor/Constant</th>
     <th  rowspan="2" scope="col">Reference Data source</th>
     
     
   </tr>
   <tr>
     
     <th scope="col">Value</th>
     <th scope="col">Unit</th>
    
     
   </tr>
   </thead>
   <tbody class="table-active">
   ${freightwater_3
     .map((a, index_a: number) => {
       if (a.category1.length == 0) {
         return ` <tr><td>${a.es}</td> <td>-</td> <td>-</td> <td>-</td> <td>-</td><td>-</td></tr>`;
       } else {
         return a.category1
           .map((b, index_b) => {
             if (b.subcat && b.subcat.subcat != 0) {
               return b.subcat
                 .map((c, index_c) => {
                   if (index_b == 0 && index_c == 0) {
                     return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td> <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                   } else if (index_c == 0) {
                     return ` <tr> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                   } else {
                     return ` <tr>  <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                   }
                 })
                 .join('');
             } else {
               if (index_b == 0) {
                 return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>-</td></tr>`;
               } else {
                 return ` <tr> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>-</td></tr>`;
               }
             }
           })
           .join('');
       }
     })
     .join('')}

   </tbody>
 
     
     </table>

     </div>
  

  
     
     </div>
     
     ${footer.replace('#pageNumber#', (++pageNumber).toString())}
     
      </div>`;
      const freightwater_4 = quantification.freightwater_4;
  const page_20 =!freightwater_4||freightwater_4.length==0?'': ` <div id="page_33" class="page text-center" >
     ${header}
     <div class="content">
     <div class="report-table-sm">
     <table class="table  table-bordered border-dark">
     <thead class="table-primary  border-dark">
     
     <tr>
     <th  rowspan="2"  scope="col">Emission source</th>
     <th  rowspan="2"  scope="col">Category</th>
     <th  rowspan="2"  scope="col">Sub Category</th>
     <th  colspan="2"  scope="col">Factor/Constant</th>
     <th  rowspan="2" scope="col">Reference Data source</th>
     
     
   </tr>
   <tr>
     
     <th scope="col">Value</th>
     <th scope="col">Unit</th>
    
     
   </tr>
   </thead>
   <tbody class="table-active">
   ${freightwater_4
     .map((a, index_a: number) => {
       if (a.category1.length == 0) {
         return ` <tr><td>${a.es}</td> <td>-</td> <td>-</td> <td>-</td> <td>-</td><td>-</td></tr>`;
       } else {
         return a.category1
           .map((b, index_b) => {
             if (b.subcat && b.subcat.subcat != 0) {
               return b.subcat
                 .map((c, index_c) => {
                   if (index_b == 0 && index_c == 0) {
                     return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td> <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                   } else if (index_c == 0) {
                     return ` <tr> <td rowspan="${b.subcat.length}">${b.name}</td> <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                   } else {
                     return ` <tr>  <td>${c.name}</td>  <td>${c.quantity}</td> <td>${c.unit}</td><td>-</td></tr>`;
                   }
                 })
                 .join('');
             } else {
               if (index_b == 0) {
                 return ` <tr><td rowspan="${a.numOfRow}" >${a.es}</td> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>-</td></tr>`;
               } else {
                 return ` <tr> <td >${b.name}</td> <td>-</td> <td>${b.quantity}</td> <td>${b.unit}</td><td>-</td></tr>`;
               }
             }
           })
           .join('');
       }
     })
     .join('')}

   </tbody>
 
     
     </table>

     </div>
  

  
     
     </div>
     
     ${footer.replace('#pageNumber#', (++pageNumber).toString())}
     
      </div>`;

  const uncertainties_1 = quantification.uncertainties_1;
  const page_21= ` <div id="page_34" class="page text-center" >
          ${header}
          <div class="content">
          <div  class="main_header_sub text-start">3.3 Uncertainties</div>

          ${uncertainties_1
            .map(
              (a: {
                title: any;
                description: any[];
              }) => `<div class="main_header_sub_sub-bold">${a.title}</div>
          <blockquote class=" paragraph blockquote text-start ">
           <p class="mb-0 lh-base">${a.description} </p></blockquote>`
           
            ).join('')}
         
          </div>
          
          ${footer.replace('#pageNumber#', (++pageNumber).toString())}
          
           </div>`;

  const uncertainties_2 = quantification.uncertainties_2;
  const page_22 =!uncertainties_2|| uncertainties_2.length==0?'': ` <div id="page_35" class="page text-center" >
         ${header}
         <div class="content">
         ${uncertainties_2
          .map(
            (a: {
              title: any;
              description: any[];
            }) => `<div class="main_header_sub_sub-bold">${a.title}</div>
        <blockquote class=" paragraph blockquote text-start ">
         <p class="mb-0 lh-base">${a.description} </p></blockquote>`
         
          ).join('')}
       
      
         
         </div>
         
         ${footer.replace('#pageNumber#', (++pageNumber).toString())}
         
          </div>`;

  const emissions = quantification.emissions;

  const page_23 = ` <div id="page_36" class="page text-center" >
          ${header}
          <div class="content">
          <div  class="main_header_sub text-start">3.4 Exclusions</div>
      
     <blockquote class=" paragraph blockquote text-start ">
       <p class="mb-0 lh-base">Emissions attributed to indirect emission sources listed in below table were excluded due to the unavailability of the
        sufficient data to quantify the GHG emissions.</p>
     </blockquote>
     <div class="report-table-sm">
     <figcaption class="figure-caption-table figure-caption text-start">List of excluded emission sources</figcaption>
     <table class="table  table-bordered border-dark">
       <thead class="table-primary  border-dark">
         <tr>
           <th scope="col">Emission source</th>
           <th scope="col">Reason</th>
           
         </tr>
       </thead>
       <tbody class="table-active">
       ${emissions
         .map(
           (a: { emission_source: any; resons: any }) =>
             `<tr> <td>${a.emission_source}</td> <td>${a.resons}</td> </tr>`,
         )
         .join('')}
        
       
         
       </tbody>
     </table>
   </div>
       
          
          </div>
          
          ${footer.replace('#pageNumber#', (++pageNumber).toString())}
          
           </div>`;

  return (
    page_1 +
    page_2 +
    page_3 +
    page_4 +
    page_5 +
    page_6 +
    page_7 +
    page_8 +
    page_9 +
    page_10 +
    page_11 +
    page_12 +
    page_13 +
    page_14 +
    page_15 +
    page_16 +
    page_17 +
    page_18 +
    page_19 +
    page_20 +
    page_21 +
    page_22 +
    page_23
  );
}
  
async result(result: result,header,footer,companyName,baseYear,inventryYear):Promise<string>{

  let pageNumber=21; 

 

  const catagury_range=result.catagury_range;
  const ghg_emission=result.ghg_emission;
      const page_1= ` <div id="page_37" class="page text-center" >
            ${header}
            <div class="content">
            <div  class="main_header text-start">4 RESULTS: EVALUATION OF GREENHOUSE GAS INVENTORY</div>
            <blockquote class=" paragraph blockquote text-start ">
            <p class="mb-0 lh-base">
            Emissions attributed to direct and indirect emission sources, categorized under relevant categories  are presented in  the following table under the relevant greenhouse gases.
            </p>
          </blockquote>
          <div class="report-table-sm">
          <figcaption class="figure-caption-table figure-caption text-start">GHG Inventory for ${baseYear}</figcaption>
          <table class="table  table-bordered border-dark">
            <thead class="table-primary  border-dark">
              <tr>
                <th class="text-center"  colspan="8"  scope="col">GHG emissions ${baseYear}</th>
                
               
                
                
              </tr>
              <tr>
              <th scope="col">Category</th>
              <th scope="col">Emission Source</th>
              <th scope="col">Ownership</th>
                <th scope="col">tCO₂e</th>
                <th scope="col">CO₂</th>
                <th scope="col">CH₄</th>
                <th scope="col">N₂O</th>
                <th scope="col">HFCs</th>
               
                
              </tr>
            </thead>
            <tbody class="table-active">
            ${ghg_emission.map((a: {
              numOfRows: any;
              category: any;
              isTotal: boolean; catagary: any; emissions: any;},index_a: number)=>{
              
             if(a.isTotal){
              return  ` <tr><th colspan="3" >${a.category}</th> <th>${a.emissions.tco2e}</th> <th>${a.emissions.co2}</th><th>${a.emissions.ch4}</th><th>${a.emissions.n2o}</th><th>${a.emissions.hfcs}</th></tr>`


             }else{
              
               if(a.emissions.length==0){
                return  ` <tr><td>${a.category}</td> <td>-</td> <td>-</td> <td>-</td> <td>-</td><td>-</td><td>-</td><td>-</td></tr>`

               }
               else{
                 return a.emissions.map((b,index_b)=>{
                 
                 if(b.ownership&&b.ownership.length!=0){
                 return b.ownership.map((c,index_c)=>{
                
                  if(index_b==0&&index_c==0){
                   
                    return  ` <tr><td rowspan="${a.numOfRows}" >${a.category}</td> <td rowspan="${b.ownership.length}">${b.name}</td> <td>${c.name}</td> <td>${c.emission.tco2e}</td> <td>${c.emission.co2}</td><td>${c.emission.ch4}</td><td>${c.emission.n2o}</td><td>${c.emission.hfcs}</td></tr>`

                  }else if(index_c==0){
                 
                    return  ` <tr> <td rowspan="${b.ownership.length}">${b.name}</td> <td>${c.name}</td> <td>${c.emission.tco2e}</td> <td>${c.emission.co2}</td><td>${c.emission.ch4}</td><td>${c.emission.n2o}</td><td>${c.emission.hfcs}</td></tr>`

                  }else{
                  
                    return  ` <tr>  <td>${c.name}</td> <td>${c.emission.tco2e}</td> <td>${c.emission.co2}</td><td>${c.emission.ch4}</td><td>${c.emission.n2o}</td><td>${c.emission.hfcs}</td></tr>`

                  }
                 }).join("");

                 }else{
                  if(index_b==0){
                    return  ` <tr><td rowspan="${a.numOfRows}" >${a.category}</td> <td >${b.name}</td> <td>-</td> <td>-</td> <td>-</td><td>-</td><td>-</td><td>-</td></tr>`

                  }else{
                    return  ` <tr> <td >${b.name}</td> <td>-</td> <td>-</td> <td>-</td><td>-</td><td>-</td><td>-</td></tr>`

                  }
                 }

                 }).join("");

               }
  
             }

              
            }).join("")}
             
            </tbody>
          </table>
          <p class="mb-0 lh-base"><small>All the values are in tCO₂e</small></p>
        </div>
    
          
            
            </div>
            
            ${footer.replace("#pageNumber#",(pageNumber).toString())}
            
              </div>`

      const ghg_emission_2=result.ghg_emission_2;
      const page_2=!ghg_emission_2||ghg_emission_2.length==0?'': ` <div id="page_38" class="page text-center" >
            ${header}
            <div class="content">
            
          <div class="report-table-sm">
          <table class="table  table-bordered border-dark">
            <thead class="table-primary  border-dark">
              <tr>
                <th class="text-center"  colspan="8"  scope="col">GHG emissions ${baseYear}</th>
                
                
                
                
              </tr>
              <tr>
              <th scope="col">Category</th>
              <th scope="col">Emission Source</th>
              <th scope="col">Ownership</th>
              <th scope="col">tCO₂e</th>
                <th scope="col">CO₂</th>
                <th scope="col">CH₄</th>
                <th scope="col">N₂O</th>
                <th scope="col">HFCs</th>
                
                
              </tr>
            </thead>
            <tbody class="table-active">
            ${ghg_emission_2.map((a: {
              numOfRows: any;
              category: any;
              isTotal: boolean; catagary: any; emissions: any;},index_a: number)=>{
              
              if(a.isTotal){
              return  ` <tr><th colspan="3" >${a.category}</th> <th>${a.emissions.tco2e}</th> <th>${a.emissions.co2}</th><th>${a.emissions.ch4}</th><th>${a.emissions.n2o}</th><th>${a.emissions.hfcs}</th></tr>`


              }else{
              
                if(a.emissions.length==0){
                return  ` <tr><td>${a.category}</td> <td>-</td> <td>-</td> <td>-</td> <td>-</td><td>-</td><td>-</td><td>-</td></tr>`

                }
                else{
                  return a.emissions.map((b,index_b)=>{
                  
                  if(b.ownership&&b.ownership.length!=0){
                  return b.ownership.map((c,index_c)=>{
                
                  if(index_b==0&&index_c==0){
                    
                    return  ` <tr><td rowspan="${a.numOfRows}" >${a.category}</td> <td rowspan="${b.ownership.length}">${b.name}</td> <td>${c.name}</td> <td>${c.emission.tco2e}</td> <td>${c.emission.co2}</td><td>${c.emission.ch4}</td><td>${c.emission.n2o}</td><td>${c.emission.hfcs}</td></tr>`

                  }else if(index_c==0){
                  
                    return  ` <tr> <td rowspan="${b.ownership.length}">${b.name}</td> <td>${c.name}</td> <td>${c.emission.tco2e}</td> <td>${c.emission.co2}</td><td>${c.emission.ch4}</td><td>${c.emission.n2o}</td><td>${c.emission.hfcs}</td></tr>`

                  }else{
                  
                    return  ` <tr>  <td>${c.name}</td> <td>${c.emission.tco2e}</td> <td>${c.emission.co2}</td><td>${c.emission.ch4}</td><td>${c.emission.n2o}</td><td>${c.emission.hfcs}</td></tr>`

                  }
                  }).join("");

                  }else{
                  if(index_b==0){
                    return  ` <tr><td rowspan="${a.numOfRows}" >${a.category}</td> <td >${b.name}</td> <td>-</td> <td>-</td> <td>-</td><td>-</td><td>-</td><td>-</td></tr>`

                  }else{
                    return  ` <tr> <td >${b.name}</td> <td>-</td> <td>-</td> <td>-</td><td>-</td><td>-</td><td>-</td></tr>`

                  }
                  }

                  }).join("");

                }
  
              }

              
            }).join("")}
              
            </tbody>
          </table>
          <p class="mb-0 lh-base"><small>All the values are in tCO₂e</small></p>
        </div>
    
          
            
            </div>
            
            ${footer.replace("#pageNumber#",(pageNumber).toString())}
            
              </div>`;

    const ghg_emission_3=result.ghg_emission_3;
    const page_3= !ghg_emission_3||ghg_emission_3.length==0?'':` <div id="page_39" class="page text-center" >
          ${header}
          <div class="content">
          
        <div class="report-table-sm">
        <table class="table  table-bordered border-dark">
          <thead class="table-primary  border-dark">
            <tr>
              <th class="text-center"  colspan="8"  scope="col">GHG emissions ${baseYear}</th>
              
              
              
              
            </tr>
            <tr>
            <th scope="col">Category</th>
            <th scope="col">Emission Source</th>
            <th scope="col">Ownership</th>
            <th scope="col">tCO₂e</th>
            <th scope="col">CO₂</th>
            <th scope="col">CH₄</th>
            <th scope="col">N₂O</th>
            <th scope="col">HFCs</th>
              
              
            </tr>
          </thead>
          <tbody class="table-active">
          ${ghg_emission_3.map((a: {
            numOfRows: any;
            category: any;
            isTotal: boolean; catagary: any; emissions: any;},index_a: number)=>{
            
            if(a.isTotal){
            return  ` <tr><th colspan="3" >${a.category}</th> <th>${a.emissions.tco2e}</th> <th>${a.emissions.co2}</th><th>${a.emissions.ch4}</th><th>${a.emissions.n2o}</th><th>${a.emissions.hfcs}</th></tr>`


            }else{
            
              if(a.emissions.length==0){
              return  ` <tr><td>${a.category}</td> <td>-</td> <td>-</td> <td>-</td> <td>-</td><td>-</td><td>-</td><td>-</td></tr>`

              }
              else{
                return a.emissions.map((b,index_b)=>{
                
                if(b.ownership&&b.ownership.length!=0){
                return b.ownership.map((c,index_c)=>{
              
                if(index_b==0&&index_c==0){
                  
                  return  ` <tr><td rowspan="${a.numOfRows}" >${a.category}</td> <td rowspan="${b.ownership.length}">${b.name}</td> <td>${c.name}</td> <td>${c.emission.tco2e}</td> <td>${c.emission.co2}</td><td>${c.emission.ch4}</td><td>${c.emission.n2o}</td><td>${c.emission.hfcs}</td></tr>`

                }else if(index_c==0){
                
                  return  ` <tr> <td rowspan="${b.ownership.length}">${b.name}</td> <td>${c.name}</td> <td>${c.emission.tco2e}</td> <td>${c.emission.co2}</td><td>${c.emission.ch4}</td><td>${c.emission.n2o}</td><td>${c.emission.hfcs}</td></tr>`

                }else{
                
                  return  ` <tr>  <td>${c.name}</td> <td>${c.emission.tco2e}</td> <td>${c.emission.co2}</td><td>${c.emission.ch4}</td><td>${c.emission.n2o}</td><td>${c.emission.hfcs}</td></tr>`

                }
                }).join("");

                }else{
                if(index_b==0){
                  return  ` <tr><td rowspan="${a.numOfRows}" >${a.category}</td> <td >${b.name}</td> <td>-</td> <td>-</td> <td>-</td><td>-</td><td>-</td><td>-</td></tr>`

                }else{
                  return  ` <tr> <td >${b.name}</td> <td>-</td> <td>-</td> <td>-</td><td>-</td><td>-</td><td>-</td></tr>`

                }
                }

                }).join("");

              }

            }

            
          }).join("")}
            
          </tbody>
        </table>
        <p class="mb-0 lh-base"><small>All the values are in tCO₂e</small></p>
      </div>
  
        
          
          </div>
          
          ${footer.replace("#pageNumber#",(pageNumber).toString())}
          
            </div>`;
      // const total_direct_emission=result.total_direct_emission;
      // const largest_direct_emission=result.largest_direct_emission;
      // const largest_direct_emission_presentage=result.largest_direct_emission_presentage;
   

      const direct_emissions = result.direct_emissions;

      const page_4= ` <div id="page_40" class="page text-center" >
      ${header}
      <div class="content">
      <div  class="main_header_sub text-start">4.1 Direct GHG emission</div>
      
      <blockquote class=" paragraph blockquote text-start ">
        <p class="mb-0 lh-base">Direct greenhouse gas emissions from the sources owned or controlled by  ${companyName} are presented in below table.</p>
      </blockquote>
 
      <div class="report-table-sm">
      <figcaption class="figure-caption-table figure-caption text-start"> Direct emissions for the inventory year ${inventryYear}</figcaption>
      <table class="table  table-bordered border-dark">
        <thead class="table-primary  border-dark">
          <tr>
            <th scope="col">Source</th>
            <th scope="col">Ownership</th>
            <th scope="col">Emissions (tCO₂e)</th>
            
          </tr>
        </thead>
        <tbody class="table-active">
        ${direct_emissions.map((a: {
          ownership: any; source: any; emission: any; 
},index_a: number)=>{
          if(a.source=="Total"){
            return  `<tr> <th colspan="2">${a.source}</th> <th>${a.emission}</th> </tr>`
          }else{
           if(a.ownership&&a.ownership.length!=0){
                return a.ownership.map((b,index_b)=>{
                   if(index_b==0){
                    return  `<tr> <td  rowspan="${a.ownership.length}">${a.source}</td><td>${b.name}</td>  <td>${b.emission}</td> </tr>`
                   }else{
                    return  `<tr><td>${b.name}</td>  <td>${b.emission}</td> </tr>`

                   }

                }).join('');
           }else{
            return  `<tr> <td>${a.source}</td><td>-</td>  <td>-</td> </tr>`
           }
          }
         
         
        }).join('')}
         
        </tbody>
      </table>
    </div>
 

      
      </div>
      
      ${footer.replace("#pageNumber#",(pageNumber).toString())}
      
      </div>`;

      const direct_emissions_2 = result.direct_emissions_2;

      const page_5= !direct_emissions_2||direct_emissions_2.length==0?'':` <div id="page_41" class="page text-center" >
      ${header}
      <div class="content">
     
 
      <div class="report-table-sm">
      <figcaption class="figure-caption-table figure-caption text-start"> Direct emissions for inventory year ${baseYear}</figcaption>
      <table class="table  table-bordered border-dark">
        <thead class="table-primary  border-dark">
          <tr>
            <th scope="col">Source</th>
            <th scope="col">Ownership</th>
            <th scope="col">Emissions (tCO2e)</th>
            
          </tr>
        </thead>
        <tbody class="table-active">
        ${direct_emissions_2.map((a: {
          ownership: any; source: any; emission: any; 
},index_a: number)=>{
          if(a.source=="Total"){
            return  `<tr> <th colspan="2">${a.source}</th> <th>${a.emission}</th> </tr>`
          }else{
           if(a.ownership&&a.ownership.length!=0){
                return a.ownership.map((b,index_b)=>{
                   if(index_b==0){
                    return  `<tr> <td  rowspan="${a.ownership.length}">${a.source}</td><td>${b.name}</td>  <td>${b.emission}</td> </tr>`
                   }else{
                    return  `<tr><td>${b.name}</td>  <td>${b.emission}</td> </tr>`

                   }

                }).join('');
           }else{
            return  `<tr> <td>${a.source}</td><td>-</td>  <td>-</td> </tr>`
           }
          }
         
         
        }).join('')}
         
        </tbody>
      </table>
    </div>
 
  

      
      </div>
      
      ${footer.replace("#pageNumber#",(pageNumber).toString())}
      
      </div>`;
      
      const figure_4_link=result.figure_4_link;
      const direct_emisions_paragraph=result.direct_emisions_paragraph;

      const page_6= ` <div id="page_42" class="page text-center" >
      ${header}
      <div class="content">
  
    <blockquote class=" paragraph blockquote text-start ">
    <p class="mb-0 lh-base">
    ${direct_emisions_paragraph}
    </p>
  </blockquote>
  <div  class="image-pie text-start"><figure class="figure ">
  <img src="${figure_4_link}" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
  <figcaption class="figure-caption">Figure 4: Direct emissions by source</figcaption>
 </figure></div>

      
      </div>
      
      ${footer.replace("#pageNumber#",(pageNumber).toString())}
      
      </div>`;
    



  
    const indirect_emissions=result.indirect_emissions;

    const page_7= `<div id="page_43" class="page text-center" >
    ${header}
    <div class="content">
    <div  class="main_header_sub text-start">4.2 Indirect GHG emissions</div>
      
    <blockquote class=" paragraph blockquote text-start ">
      <p class="mb-0 lh-base">
      Due to their nature and wider scope, some indirect emissions are difficult to be assigned for a 
      specific operation. Further, data availability and reporting methods on some indirect emissions vary 
      considerably. Following indirect emissions have been identified and calculated based on the availability of data.
      </p>
    </blockquote>


    <div class="report-table-sm">
    <figcaption class="figure-caption-table figure-caption text-start">Indirect emissions for inventory year ${baseYear}</figcaption>
    <table class="table  table-bordered border-dark">
      <thead class="table-primary  border-dark">
        <tr>
          <th scope="col">Source</th>
          <th scope="col">Ownership</th>
          <th scope="col">Indirect Emissions (tCO₂e)</th>
          
        </tr>
      </thead>
      <tbody class="table-active">
      ${indirect_emissions.map((a: {
        ownership: any; source: any; emission: any; 
},index_a: number)=>{
        if(a.source=="Total"){
          return  `<tr> <th colspan="2">${a.source}</th> <th>${a.emission}</th> </tr>`
        }else{
         if(a.ownership&&a.ownership.length!=0){
              return a.ownership.map((b,index_b)=>{
                 if(index_b==0){
                  return  `<tr> <td  rowspan="${a.ownership.length}">${a.source}</td><td>${b.name}</td>  <td>${b.emission}</td> </tr>`
                 }else{
                  return  `<tr><td>${b.name}</td>  <td>${b.emission}</td> </tr>`

                 }

              }).join('');
         }else{
          return  `<tr> <td>${a.source}</td><td>-</td>  <td>-</td> </tr>`
         }
        }
       
       
      }).join('')}
       
      </tbody>
    </table>
  </div>

         


    </div>

    ${footer.replace("#pageNumber#",(pageNumber).toString())}

    </div>`


     
    const indirect_emisions_paragraph=result.indirect_emisions_paragraph;
const figure_5_link=result.figure_5_link;

    const page_8= ` <div id="page_44" class="page text-center" >
    ${header}
    <div class="content">

    <blockquote class=" paragraph blockquote text-start ">
    <p class="mb-0 lh-base">
      ${indirect_emisions_paragraph}
    </p>
  </blockquote>
   
    <div  class="image-pie "><figure class="figure ">
    <img src="${figure_5_link}" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
    <figcaption class="figure-caption">Figure 5: Indirect Emissions by sources</figcaption>
   </figure></div>


    </div>

    ${footer.replace("#pageNumber#",(pageNumber).toString())}

    </div>`


  return page_1+page_2+page_3+page_4+page_5+page_6+page_7+page_8;

    
  }
  

async comparison(comparison:any,header,footer,companyName,baseYear,inventryYear):Promise<string>{


  let pageNumber=25; 
  
         const calculate_start=comparison.calculate_start;
      

         const comparison_ghg_emission=comparison.comparison_ghg_emission;

         const page_1= ` <div id="page_45" class="page text-center" >
         ${header}
         <div class="content">
         <div  class="main_header text-start">5 COMPARISON OF CARBON FOOTPRINT OF ${inventryYear} WITH THE BASE YEAR</div>
            <div  class="main_header_sub text-start">5.1 Comparison of organizational GHG emissions</div>

            <blockquote class=" paragraph blockquote text-start ">
                <p class="mb-0 lh-base">
                ${companyName} has calculated GHG emissions attributed to its operations since ${baseYear}.
                Emission trends of each emission source are shown in the following table.
                </p>
            </blockquote>
            <div class="report-table-sm">
            <figcaption class="figure-caption-table figure-caption text-start">Direct emissions for inventory year ${inventryYear}</figcaption>
            <table class="table  table-bordered border-dark">
              <thead class="table-primary  border-dark">
                <tr>
                  <th  rowspan="2"  scope="col">Emission category</th>
                  <th  rowspan="2"  scope="col">Emission source</th>
                  <th  rowspan="2"  scope="col">Ownership</th>
                  <th  colspan="${comparison_ghg_emission.years.length}"  scope="col">Annual Emission (tCO2e)</th>
                 
                  
                  
                </tr>
                <tr>
                  ${comparison_ghg_emission.years.map(a=> ` <th scope="col">${a}</th>`).join('')}
                   
                </tr>
              </thead>
              <tbody class="table-active">
              ${comparison_ghg_emission.catagaries.map((a: {
                numOfRows: any;
                category: any;
                isTotal: boolean; catagary: any; emissions: any;},index_a: number)=>{
                
               if(a.isTotal){
                return  ` <tr><th colspan="3" >${a.catagary}</th>${a.emissions[0].years.map(b=> `<th>${b}</th>`).join('')}</tr>`
  
  
               }else{
                
                 if(a.emissions.length==0){
                  return  ` <tr><td>${a.category}</td> <td>-</td> <td>-</td> ${comparison_ghg_emission.years.map(a=> ` <td>-</td>`).join('')}</tr>`
  
                 }
                 else{
                   return a.emissions.map((b,index_b)=>{
                   
                   if(b.ownership&&b.ownership.length!=0){
                   return b.ownership.map((c,index_c)=>{
                  
                    if(index_b==0&&index_c==0){
                     
                      return  ` <tr><td rowspan="${a.numOfRows}" >${a.catagary}</td> <td rowspan="${b.ownership.length}">${b.name}</td> <td>${c.name}</td> ${c.years.map(d=> `<td>${d}</td>`).join('')}</tr>`
  
                    }else if(index_c==0){
                   
                      return  ` <tr> <td rowspan="${b.ownership.length}">${b.name}</td> <td>${c.name}</td>  ${c.years.map(d=> `<td>${d}</td>`).join('')}</tr>`
  
                    }else{
                    
                      return  ` <tr>  <td>${c.name}</td>  ${c.years.map(d=> `<td>${d}</td>`).join('')}</tr>`
  
                    }
                   }).join("");
  
                   }else{
                    if(index_b==0){
                      return  ` <tr><td rowspan="${a.numOfRows}" >${a.catagary}</td> <td >${b.name}</td> <td>-</td>${comparison_ghg_emission.years.map(a=> ` <td>-</td>`).join('')}</tr>`
  
                    }else{
                      return  ` <tr> <td >${b.name}</td> <td>-</td>${comparison_ghg_emission.years.map(a=> ` <td>-</td>`).join('')}</tr>`
  
                    }
                   }
  
                   }).join("");
  
                 }
    
               }
  
                
              }).join("")}


              </tbody>
            </table>
          </div>




      
         
         </div>
         
         ${footer.replace("#pageNumber#",(pageNumber).toString())}
         
          </div>`

          const comparison_ghg_emission_2=comparison.comparison_ghg_emission_2;

          const page_2=!comparison_ghg_emission_2||comparison_ghg_emission_2.catagaries.length==0?'': ` <div id="page_46" class="page text-center" >
          ${header}
          <div class="content">
          
             <div class="report-table-sm">
             <table class="table  table-bordered border-dark">
               <thead class="table-primary  border-dark">
                 <tr>
                   <th  rowspan="2"  scope="col">Emission category</th>
                   <th  rowspan="2"  scope="col">Emission source</th>
                   <th  rowspan="2"  scope="col">Ownership</th>
                   <th  colspan="${comparison_ghg_emission_2.years.length}"  scope="col">Activity Data</th>
                  
                   
                   
                 </tr>
                 <tr>
                   ${comparison_ghg_emission_2.years.map(a=> ` <th scope="col">${a}</th>`).join('')}
                    
                 </tr>
               </thead>
               <tbody class="table-active">
               ${comparison_ghg_emission_2.catagaries.map((a: {
                 numOfRows: any;
                 category: any;
                 isTotal: boolean; catagary: any; emissions: any;},index_a: number)=>{
                 
                if(a.isTotal){
                 return  ` <tr><th colspan="3" >${a.catagary}</th>${a.emissions[0].years.map(b=> `<th>${b}</th>`).join('')}</tr>`
   
   
                }else{
                 
                  if(a.emissions.length==0){
                   return  ` <tr><td>${a.category}</td> <td>-</td> <td>-</td> ${comparison_ghg_emission.years.map(a=> ` <td>-</td>`).join('')}</tr>`
   
                  }
                  else{
                    return a.emissions.map((b,index_b)=>{
                    
                    if(b.ownership&&b.ownership.length!=0){
                    return b.ownership.map((c,index_c)=>{
                   
                     if(index_b==0&&index_c==0){
                      
                       return  ` <tr><td rowspan="${a.numOfRows}" >${a.catagary}</td> <td rowspan="${b.ownership.length}">${b.name}</td> <td>${c.name}</td> ${c.years.map(d=> `<td>${d}</td>`).join('')}</tr>`
   
                     }else if(index_c==0){
                    
                       return  ` <tr> <td rowspan="${b.ownership.length}">${b.name}</td> <td>${c.name}</td>  ${c.years.map(d=> `<td>${d}</td>`).join('')}</tr>`
   
                     }else{
                     
                       return  ` <tr>  <td>${c.name}</td>  ${c.years.map(d=> `<td>${d}</td>`).join('')}</tr>`
   
                     }
                    }).join("");
   
                    }else{
                     if(index_b==0){
                       return  ` <tr><td rowspan="${a.numOfRows}" >${a.catagary}</td> <td >${b.name}</td> <td>-</td>${comparison_ghg_emission.years.map(a=> ` <td>-</td>`).join('')}</tr>`
   
                     }else{
                       return  ` <tr> <td >${b.name}</td> <td>-</td>${comparison_ghg_emission.years.map(a=> ` <td>-</td>`).join('')}</tr>`
   
                     }
                    }
   
                    }).join("");
   
                  }
     
                }
   
                 
               }).join("")}
 
 
               </tbody>
             </table>
           </div>
 
 
 
 
       
          
          </div>
          
          ${footer.replace("#pageNumber#",(pageNumber).toString())}
          
           </div>`
           const comparison_ghg_emission_3=comparison.comparison_ghg_emission_3;

           const page_3=!comparison_ghg_emission_3|| comparison_ghg_emission_3.catagaries.length==0?'': ` <div id="page_47" class="page text-center" >
           ${header}
           <div class="content">
           
              <div class="report-table-sm">
              <figcaption class="figure-caption-table figure-caption text-start">Direct emissions for inventory year 2020</figcaption>
              <table class="table  table-bordered border-dark">
                <thead class="table-primary  border-dark">
                  <tr>
                    <th  rowspan="2"  scope="col">Emission category</th>
                    <th  rowspan="2"  scope="col">Emission source</th>
                    <th  rowspan="2"  scope="col">Ownership</th>
                    <th  colspan="${comparison_ghg_emission_3.years.length}"  scope="col">Activity Data</th>
                   
                    
                    
                  </tr>
                  <tr>
                    ${comparison_ghg_emission_3.years.map(a=> ` <th scope="col">${a}</th>`).join('')}
                     
                  </tr>
                </thead>
                <tbody class="table-active">
                ${comparison_ghg_emission_3.catagaries.map((a: {
                  numOfRows: any;
                  category: any;
                  isTotal: boolean; catagary: any; emissions: any;},index_a: number)=>{
                  
                 if(a.isTotal){
                  return  ` <tr><th colspan="3" >${a.catagary}</th>${a.emissions[0].years.map(b=> `<th>${b}</th>`).join('')}</tr>`
    
    
                 }else{
                  
                   if(a.emissions.length==0){
                    return  ` <tr><td>${a.category}</td> <td>-</td> <td>-</td> ${comparison_ghg_emission.years.map(a=> ` <td>-</td>`).join('')}</tr>`
    
                   }
                   else{
                     return a.emissions.map((b,index_b)=>{
                     
                     if(b.ownership&&b.ownership.length!=0){
                     return b.ownership.map((c,index_c)=>{
                    
                      if(index_b==0&&index_c==0){
                       
                        return  ` <tr><td rowspan="${a.numOfRows}" >${a.catagary}</td> <td rowspan="${b.ownership.length}">${b.name}</td> <td>${c.name}</td> ${c.years.map(d=> `<td>${d}</td>`).join('')}</tr>`
    
                      }else if(index_c==0){
                     
                        return  ` <tr> <td rowspan="${b.ownership.length}">${b.name}</td> <td>${c.name}</td>  ${c.years.map(d=> `<td>${d}</td>`).join('')}</tr>`
    
                      }else{
                      
                        return  ` <tr>  <td>${c.name}</td>  ${c.years.map(d=> `<td>${d}</td>`).join('')}</tr>`
    
                      }
                     }).join("");
    
                     }else{
                      if(index_b==0){
                        return  ` <tr><td rowspan="${a.numOfRows}" >${a.catagary}</td> <td >${b.name}</td> <td>-</td>${comparison_ghg_emission.years.map(a=> ` <td>-</td>`).join('')}</tr>`
    
                      }else{
                        return  ` <tr> <td >${b.name}</td> <td>-</td>${comparison_ghg_emission.years.map(a=> ` <td>-</td>`).join('')}</tr>`
    
                      }
                     }
    
                     }).join("");
    
                   }
      
                 }
    
                  
                }).join("")}
  
  
                </tbody>
              </table>
            </div>
  
  
  
  
        
           
           </div>
           
           ${footer.replace("#pageNumber#",(pageNumber).toString())}
           
            </div>`
   

          const ghg_emission_for_years=comparison.ghg_emission_for_years;


          const figure_6_link=comparison.figure_6_link;
          const comparison_paragraph_1=comparison.comparison_paragraph_1;
          const comparison_paragraph_2=comparison.comparison_paragraph_2;
          
          const page_4= ` <div id="page_48" class="page text-center" >
          ${header}
          <div class="content">
          <div  class="main_header_sub text-start">5.2 Comparison of organizational carbon footprint over the years</div>

          <blockquote class=" paragraph blockquote text-start ">
              <p class="mb-0 lh-base">
              ${comparison_paragraph_1}
              </p>
          </blockquote>
          <div  class="image-medium text-start"><figure class="figure ">
          <img src="${figure_6_link}" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
          <figcaption class="figure-caption">Figure 6: Comparison of overall emissions over the years</figcaption>
         </figure></div>
         <div  class="main_header_sub text-start">5.3 Comparison of direct GHG emissions over the years</div>

         <blockquote class=" paragraph blockquote text-start ">
             <p class="mb-0 lh-base">
           ${comparison_paragraph_2}
             </p>
         </blockquote>
       
          
          </div>
          
          ${footer.replace("#pageNumber#",(++pageNumber).toString())}
          
           </div>`


           const comparison_paragraph_3=comparison.comparison_paragraph_3;
           const figure_7_link=comparison.figure_7_link;
           const figure_8_link=comparison.figure_8_link;

           const page_5= ` <div id="page_49" class="page text-center" >
           ${header}
           <div class="content">
           <div  class="image-medium text-start"><figure class="figure ">
           <img src="${figure_7_link}" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
           <figcaption class="figure-caption">Figure 7: Comparison of direct emissions over the years</figcaption>
          </figure></div>
          <div  class="main_header_sub text-start">5.4 Comparison of indirect GHG emissions over the years</div>

          <blockquote class=" paragraph blockquote text-start ">
              <p class="mb-0 lh-base">
              ${comparison_paragraph_3} </p>
          </blockquote>
           
          <div  class="image-medium text-start"><figure class="figure ">
          <img src="${figure_8_link}" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
          <figcaption class="figure-caption">Figure 8: Comparison of Indirect emissions over the years<sup>14</sup></figcaption>
         </figure></div>
        
           
           </div>
           ${footer.replace("#pageNumber#",(++pageNumber).toString())}
            </div>`


           const table_8=comparison.table_8;

            const comparison_paragraph_4=comparison.comparison_paragraph_4;
            const comparison_paragraph_5=comparison.comparison_paragraph_5;
            const figure_9_link=comparison.figure_9_link;

            const page_6= ` <div id="page_50" class="page text-center" >
            ${header}
            <div class="content">
            <div  class="main_header_sub text-start">5.5 Comparisons of emission factors & other constants</div>

            <blockquote class=" paragraph blockquote text-start ">
                <p class="mb-0 lh-base">
                ${comparison_paragraph_4}</p>
            </blockquote>
  
            <div class="report-table-sm">
            <figcaption class="figure-caption-table figure-caption text-start">Comparison of ${table_8.name}</figcaption>
            <table class="table  table-bordered border-dark">
              <thead class="table-primary  border-dark">
                <tr>
                  <th scope="col">Emission factors/constants</th>
                  ${table_8.years.map(a=> `  <th scope="col">${a}</th>`).join('')}
                
                  
                </tr>
              </thead>
              <tbody class="table-active">
              ${table_8.emissions_factors.map((a: { name: any; years:any[] })=>`<tr> <td>${a.name}</td>  ${a.years.map(b=> `  <td>${b}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
          </div>
         
          <div  class="main_header_sub text-start">5.6 Comparisons of per capita emission and emission intensity</div>
  
          <blockquote class=" paragraph blockquote text-start ">
              <p class="mb-0 lh-base">
              ${comparison_paragraph_5} </p>
          </blockquote>
           
          <div  class="image-medium text-start"><figure class="figure ">
          <img src="${figure_9_link}" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
          <figcaption class="figure-caption">Figure 9: Comparison of per capita emission over the years</figcaption>
         </figure></div>
        
         
            
            </div>
            
            ${footer.replace("#pageNumber#",(++pageNumber).toString())}
            
             </div>`

            const figure_10_link=comparison.figure_10_link;
            const paragraph_6=comparison.comparison_paragraph_6;

             const page_7= ` <div id="page_51" class="page text-center" >
            ${header}
            <div class="content">

            
          <blockquote class=" paragraph blockquote text-start ">
          <p class="mb-0 lh-base">
           ${paragraph_6} </p>
          </blockquote>

            <div  class="image-medium text-start"><figure class="figure ">
            <img src="${figure_10_link}" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
            <figcaption class="figure-caption">Figure 10: Comparison of emission intensity over the years</figcaption>
           </figure></div>
         
            
            </div>
            
            ${footer.replace("#pageNumber#",(++pageNumber).toString())}
            
             </div>`



  return page_1+page_2+page_3+page_4+page_5+page_6+page_7;
    
  }

async conclution(conclution: any,header,footer,companyName,inventryYear):Promise<string>{
 


  let pageNumber=30; 
  const total_ghg_emission=conclution.total_ghg_emission;
  const requirements_of=conclution.requirements_of;

  const page_one= ` <div id="page_52" class="page text-center" >
         ${header}
         <div class="content">
         <div  class="main_header text-start">6 CONCLUSION</div>

         <blockquote class=" paragraph blockquote text-start ">
         <p class="mb-0 lh-base">
         Total GHG emissions of ${companyName} for inventory year ${inventryYear} is ${total_ghg_emission}, which was calculated in accordance with the requirements of ${requirements_of}.</p>
     </blockquote>
     
        <blockquote class=" paragraph blockquote text-start ">
        <p class="mb-0 lh-base">
        ClimateSI believes that this assessment will support to enhance the brand image of ${companyName}. In addition, the outcomes of this assessment will also support to
          identify more opportunities for GHG reduction.</p>
      </blockquote>
      
         
         </div>
         
         ${footer.replace("#pageNumber#",(pageNumber).toString())}
         
          </div>`


  return page_one;
    
  }
async recomendation(recomendation:any,header,footer):Promise<string>{
  let pageNumber=31; 



  // const branch=recomendation.branch;
  // const calculation_especially=recomendation.calculation_especially;
  const recommendation=recomendation.recommendation;


  const page_one= ` <div id="page_53" class="page text-center" >
         ${header}
         <div class="content">
         <div  class="main_header text-start">7 RECOMMENDATIONS</div>

         <div  class="main_header_sub text-start">7.1 Information management system</div>
         ${recommendation.map((a: { title: any; description: any; })=>`<div class="main_header_sub_sub-bold">${a.title}  </div>
        ${ a.description?`<blockquote class=" paragraph blockquote text-start ">
         <p class="mb-0 lh-base">${a.description} </p>
         </blockquote>`:''}`).join('')} 
         </div>
         
         ${footer.replace("#pageNumber#",(pageNumber).toString())}
         
          </div>`
          const recommendation_2=recomendation.recommendation_2;


          const page_2=!recommendation_2||recommendation_2.length==0?'': ` <div id="page_54" class="page text-center" >
                 ${header}
                 <div class="content">
                
                 ${recommendation_2.map((a: { title: any; description: any; })=>`<div class="main_header_sub_sub-bold">${a.title}  </div>
                ${ a.description?`<blockquote class=" paragraph blockquote text-start ">
                 <p class="mb-0 lh-base">${a.description} </p>
                 </blockquote>`:''}`).join('')} 
                 </div>
                 
                 ${footer.replace("#pageNumber#",(pageNumber).toString())}
                 
                  </div>`


  return page_one+page_2;
    
  }
async ongoinGhgMitigation(ongoinGhgMitigation: any,header,footer,companyName):Promise<string>{

  let pageNumber=32; 
 const mitigation = ongoinGhgMitigation.mitigation;
  const page_1= ` <div id="page_55" class="page text-center" >
         ${header}
         <div class="content">
         <div  class="main_header text-start">8 ONGOING GHG MITIGATION AND REMOVAL ENHANCEMENT PROJECTS</div>

         <blockquote class=" paragraph blockquote text-start ">
           <p class="mb-0 lh-base">Number of actions have been taken to increase the natural capital of ${companyName}. Following indicates few of them</p>
         </blockquote>

         ${mitigation.map((a: { title: any; description: any; })=>`<div class="main_header_sub_sub-bold">${a.title}  </div>
         <blockquote class=" paragraph blockquote text-start ">
         <p class="mb-0 lh-base">${a.description} </p>
         </blockquote>`).join('')}

         </div>
         
         ${footer.replace("#pageNumber#",(pageNumber).toString())}
         
          </div>`


  return page_1;
    
  }
async nextSteps(nextSteps: any,header,footer):Promise<string>{
  let pageNumber=33; 
  const nestSteps=nextSteps.nestSteps;

  const page_one= ` <div id="page_33" class="page text-center" >
         ${header}
         <div class="content">
         <div  class="main_header text-start">9 NEXT STEPS</div>
         <div class="list-main">
           <ul>
           ${nestSteps.map((a: string)=>{return '<li><blockquote class="blockquote "><p class="mb-0 lh-base">'+a+'</p></blockquote></li>'}).join('')}          
           </ul> 
         </div>
      
         
         </div>
         
         ${footer.replace("#pageNumber#",(pageNumber).toString())}
         
          </div>`



  return page_one;
    
  }
                                      
async annex(annexs: any,header,footer):Promise<string>{

const annex=annexs.annex;
 const annex_na=annexs.annex_na;
 let pageNumber=34; 

const page_one= ` <div id="page_34" class="page text-center" >
       ${header}
       <div class="content">
     
       <div  class="main_header text-start">ANNEX 1</div>
       <div class="main_header_sub_sub-bold">Branches which have outsourced or use common stand by generators</div>
       <div class="report-table-sm">
       <table class="table  table-bordered border-dark">
         
         <tbody class="table-active">
         ${annex.map((a: { barnch: any; city: any; })=>`<tr> <td>${a.barnch}</td> <td>${a.city}</td> </tr>`).join('')}


        
         </tbody>
       </table>
     </div>


     <div class="main_header_sub_sub-bold">Branches which have not used /not available stand by generators</div>
     <div class="report-table-sm">
     <table class="table  table-bordered border-dark">
       
       <tbody class="table-active">
       ${annex_na.map((a: { barnch: any; city: any; })=>`<tr> <td>${a.barnch}</td> <td>${a.city}</td> </tr>`).join('')}
       </tbody>
     </table>
   </div>
       
       </div>
       
       ${footer.replace("#pageNumber#",(pageNumber).toString())}
       
        </div>`


  return page_one;
    
  }






  @Get('report')
  async reportTest(
    @Response() res
  ):Promise<any> {
    console.log("test");
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline;filename=yolo.pdf')
   return res.send(await this.reportGenarate())
   
  }

  async reportGenarate():Promise<any>{
  const html_to_pdf = require('html-pdf-node');
  let fileName = `testKH.pdf`;
  let options = {
    format: 'A4',
    margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' },
    path: './public/' + fileName,
    printBackground: true
  };
  let file = {
    content:
      `<!DOCTYPE html>
      <html lang="en">
      <head>
      <title>Bootstrap Example</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-iYQeCzEYFbKjA/T2uDLTpkwGzCiq6soy8tYaI1GyVh/UjpbCx/TYkiZhlZB6+fzT" crossorigin="anonymous">
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-u1OknCvxWvY5kfmNBILK2hRnQC3Pr17a+RTT6rIHI7NnikvbZlHgTPOOmMi466C8" crossorigin="anonymous"></script>
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
      <link rel="stylesheet" href="http://localhost:7080/report/css/reportserver.css">
          </head>


          <body>

          <div id="cover">
          <div  style="height: 250px;">
          <div  class="row ">
              <div  class="col ">
              <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
              </div>                
          </div>
          <div class="row ">
              <div class="col h2">
                  GREENHOUSE GAS INVENTORY REPORT
              </div>
          </div>
          <div class="row ">
              <div class="col h4">
                  COMMERCIAL BANK OF CEYLON PLC
              </div>
          </div>
          <div class="row ">
              <div class="col h4">
                  INVENTORY YEAR 2020
              </div>
          </div>
          </div>
          <div style="height: 650px;margin-top: 100px;margin-bottom: 0px;" >
              <img height="100%" width="100%"  src="http://localhost:7080/report/cover/cover_image.png" > 
          </div>
          <div style="height: 100px;margin-bottom: 50px;margin-top: 50px;" >
          <div class="row ">
              
              <div class="col-2">
                  <img height="100px" style="padding: 0px;" src="http://localhost:7080/report/cover/climatesi_logo.png" >
              </div>
          </div>
          </div>
          </div>


          <div id="page_2" class=" page  text-center" >
          <div class="header">
           <div class="row ">
             <!-- <div class="col-1"></div> -->
             <div class="col-8 align-self-center">
                 Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
             </div>
             <div class="col-4 align-self-center">
                 <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
             </div>
           </div>
           <div  class="row">
           </div>
          </div>

          <div class="content">
          <div  style="height: 40px; padding-top: 10px;margin-left: 100px; margin-right: 100px;"  class="row">
          This report was prepared for the sole purpose of the following authority:
          </div>
      <div style=" height: 450px;margin-top: 10px;margin-left: 100px; margin-right: 100px;"  class="row  ">
      <div  class="col-5 align-self-start"> <img style="margin-top: 70px;" height="50px" src="http://localhost:7080/report/cover/logo.png" ></div>
      <div  class="col-7">
          
              <ul style="margin-top: 50px;list-style: none;" class="list-group list-group-flush text-start">
              <li  style="margin-top: 15px;">Commercial Bank of Ceylon PLC</li>
              <li  style="margin-top: 15px;">Address: Commercial House, No 21,</li>
              <li  style="margin-top: 15px;">Sir Razik Fareed Mawatha, P.O. Box 856,</li>
              <li  style="margin-top: 15px;">Colombo 01.</li>
              <li  style="margin-top: 15px;">Company registration No: PQ116</li>
              <li  style="margin-top: 15px;">E-mail: info@comBank.net</li>
              <li style="margin-top: 15px;">Telephone: +94 11 2486000</li>
              <li  style="margin-top: 15px;">Fax: +94 11 2449889</li>
              </ul>

          </div>
      </div>

      <div style="height: 10px; margin-top: 10px;margin-left: 100px; margin-right: 100px;" class="row">
          The assessment was carried out and the report was prepared by:
      </div>
      <div style=" height: 450px;margin-top: 10px;margin-left: 100px; margin-right: 100px;" class="row">
          <div  class="col-5 align-self-start">
              <img height="100px" style="padding: 0px;margin-top: 80px;" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
       <div  class="col-7">

          <ul style="margin-top: 50px;list-style: none;" class="list-group list-group-flush text-start">
              <li style="margin-top: 15px;">Commercial Bank of Ceylon PLC</li>
              <li style="margin-top: 15px;">Address: Commercial House, No 21,</li>
              <li style="margin-top: 40px;" >Sir Razik Fareed Mawatha, P.O. Box 856,</li>
              <li style="margin-top: 15px;">Colombo 01.</li>
              <li style="margin-top: 15px;">Company registration No: PQ116</li>
              <li style="margin-top: 15px;">E-mail: info@comBank.net</li>
              <li style="margin-top: 80px;">Reporting period: Inventory Year 2020</li>
              <li style="margin-top: 20px;">Version of the report</li>
              </ul>
       </div>
      </div>
          </div>
       
          <div  class="footer">
             <div class="row ">
                 <div style="background-color: #082160;" class="col-4"></div>
                 <div style="background-color: green;" class="col-4"></div>
                 <div style="background-color: yellow;" class="col-4"></div>
             </div>
             <div class="row ">
                 <div class="col-2 align-self-center">2 | Page</div>
                 <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                 <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
             </div>
             
          </div>
           </div>
 




           <div id="page_3" class="page text-center" >
             <div class="header">
              <div class="row ">
                
                <div class="col-8 align-self-center">
                    Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
                </div>
                <div class="col-4 align-self-center">
                    <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
                </div>
              </div>
              <div  class="row">
    
              </div>
    
    
             </div>
             <div class="content">
             
             <div  class="main_header text-start">EXECUTIVE SUMMARY</div>
             <blockquote class=" paragraph blockquote text-start ">
               <p class="mb-0 lh-base">Global warming is an overwhelming environmental issue caused due to release of greenhouse
                    gases (GHGs) to the atmosphere by man-made activities since the industrial revolution.
                    Reducing atmospheric emissions is now a major task for a company to become more environmentally friendly and conscious.</p>
             </blockquote>
             <blockquote class=" paragraph blockquote text-start">
               <p class="mb-0 lh-base">Commercial Bank of Ceylon PLC (The Bank), as a carbon conscious private sector Bank in Sri Lanka
                   , has decided to measure and report its GHG emissions for the fourth consecutive year.  </p>
             </blockquote>

             <blockquote class=" paragraph blockquote text-start">
               <p class="mb-0 lh-base">This report details the quantification of GHG emissions of the Bank for the year 2020 (1st January 2020 – 31st December 2020).
                    The boundary of this assessment is Commercial Bank of Ceylon PLC covering the head office, 268 branches Island wide, holiday homes, quarters1. </p>
             </blockquote>
             <blockquote class=" paragraph blockquote text-start">
               <p class="mb-0 lh-base">This study quantifies and reports the organizational level GHG emissions based on data received from the Bank in accordance with ISO 14064-1-2018 and United
                    Nations Intergovernmental Panel on Climate Change’s (IPCC) Fifth Assessment Report (AR5). All GHG emissions were reported as tonnes of CO₂ equivalent (tCO₂e).  </p>
             </blockquote>
             <blockquote class=" paragraph blockquote text-start">
               <p class="mb-0 lh-base">Reporting of GHG emissions were more comprehensive as it includes not only direct GHG emissions but
                    also wide range of indirect GHG emissions, which are not within the control of the organization.
                    Data collection from the Bank was also quite complete, but there is still room for improvement of the data related to indirect GHG emissions.    </p>
             </blockquote>
             <div  class="image-medium text-start"><figure class="figure ">
               <img src="http://localhost:7080/report/figures/figure1.png" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
               <figcaption class="figure-caption">Figure 1: GHG emissions for inventory year 2020</figcaption>
             </figure></div>
             
             
             
             
             
             
             </div>
          
             <div  class="footer">
                <div class="row ">
                    <div style="background-color: #082160;" class="col-4"></div>
                    <div style="background-color: green;" class="col-4"></div>
                    <div style="background-color: yellow;" class="col-4"></div>
                </div>
                <div class="row ">
                    <div class="col-2 align-self-center">3 | Page</div>
                    <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                    <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
                </div>
                
    
             </div>
              </div>

              



              <div id="page_4" class="page text-center" >
              <div class="header">
               <div class="row ">
                 
                 <div class="col-8 align-self-center">
                     Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
                 </div>
                 <div class="col-4 align-self-center">
                     <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
                 </div>
               </div>
               <div  class="row">
     
               </div>
     
     
              </div>
              <div class="content">
              
              <blockquote class=" paragraph blockquote text-start ">
              <p class="mb-0 lh-lg">As Figure 1 illustrates, the total carbon footprint of the Bank, for the 2020 is 9,490 tCO₂e.</p>
            </blockquote>
            <blockquote class=" paragraph blockquote text-start ">
              <p class="mb-0 lh-lg">   Per capita emissions and emission intensity for the assessment year are 1.99 tCO₂e 
                per person and 0.06 tCO₂e per million rupees respectively (considering direct and indirect emissions).</p>
            </blockquote>
            <div style="margin-top: 50px;" class="image-larg "><figure class="figure ">
              <img src="http://localhost:7080/report/figures/figure2.png" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
              <figcaption class="figure-caption">Figure 2: GHG emissions by source for the inventory year 2020</figcaption>
            </figure></div>
            <blockquote class=" paragraph blockquote text-start ">
              <p class="mb-0 lh-lg"> As per Figure 2, GHG emissions due to grid connected electricity 
                (6,024 tCO₂e, 63% of the total GHG emissions), is the largest GHG emission source, which 
                is followed by employee commuting not paid by the company
                 (1,320 tCO₂e, 14%), and transmission and distribution loss of electricity (602 tCO₂e, 6%).</p>
            </blockquote>
              
              </div>
           
              <div  class="footer">
                 <div class="row ">
                     <div style="background-color: #082160;" class="col-4"></div>
                     <div style="background-color: green;" class="col-4"></div>
                     <div style="background-color: yellow;" class="col-4"></div>
                 </div>
                 <div class="row ">
                     <div class="col-2 align-self-center">4 | Page</div>
                     <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                     <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
                 </div>
                 
     
              </div>
               </div>






               <div id="page_5" class="page text-center" >
               <div class="header">
                <div class="row ">
                  
                  <div class="col-8 align-self-center">
                      Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
                  </div>
                  <div class="col-4 align-self-center">
                      <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
                  </div>
                </div>
                <div  class="row">
      
                </div>
      
      
               </div>
               <div class="content">
               
               <div class="table-of-content ">
                  <div  class="table-of-content-main-headers text-start">Table of Contents</div>
                  <div class="table-of-content-header-item"><div >SUMMARY.......................................................................................................................................................................................</div><div ><bdi>.............3</bdi></div> </div>
                  <div class="table-of-content-header-item" ><div >List of Tables ....................................................................................................................................................................</div><div ><bdi>.............7</bdi></div> </div>
                  <div class="table-of-content-header-item"><div >List of Tables ................................................................................................................................................................</div><div ><bdi>.................7</bdi></div> </div>
                  <div class="table-of-content-header-item"><div >1 INTRODUCTION ....................................................................................................................................................................</div><div ><bdi>.............10</bdi></div> </div>
                  
                    
                    <div class="table-of-content-sub-header-item"><div >1.1 Introduction to the organization ................................................................................................................................</div><div ><bdi>.................11</bdi></div> </div>
                    <div class="table-of-content-sub-header-item"><div >1.2 Persons responsible ..................................................................................................................................................</div><div ><bdi>.............11</bdi></div> </div>
                    <div class="table-of-content-sub-header-item"><div >1.3 Purpose of the report ..................................................................................................................................................</div><div ><bdi>.............11</bdi></div> </div>
                    <div class="sub-sub table-of-content-sub-header-item"> <div >1.4 Intended users ........................................................................................................................................................................</div><div ><bdi>.....11</bdi></div></div>
                    <div class="table-of-content-sub-header-item"><div >1.5 Dissemination policy ....................................................................................................................................................</div><div ><bdi>.....12</bdi></div> </div>
                    <div class="table-of-content-sub-header-item"><div >1.6 Reporting period and frequency of reporting .........................................................................................................................................................</div><div ><bdi>.....12</bdi></div> </div>
                    <div class="table-of-content-sub-header-item"><div >1.7 Base year .........................................................................................................................................................</div><div ><bdi>.....12</bdi></div> </div>
                    <div class="table-of-content-sub-header-item"><div >1.8 Data and information (List of GHGs account)  .........................................................................................................................................................</div><div ><bdi>.....12</bdi></div> </div>
                   

                    <div class="table-of-content-header-item"><div >2 BOUNDARIES.................................................................................................................................................................</div><div ><bdi>.....13</bdi></div> </div>
                    <div class="table-of-content-sub-header-item"><div >2.1 Setting up the organizational boundaries ................................................................................................................................</div><div ><bdi>.................13</bdi></div> </div>
                    <div><div class="sub-sub table-of-content-sub-header-item"> <div >2.1.1 Control approach ........................................................................................................................................................................</div><div ><bdi>.....13</bdi></div></div></div>
                    <div class="table-of-content-sub-header-item"><div >2.2 Reporting boundaries ....................................................................................................................................................</div><div ><bdi>.....14</bdi></div> </div>
                    <div><div class="sub-sub table-of-content-sub-header-item"> <div >2.2.1 Direct GHG emissions ........................................................................................................................................................................</div><div ><bdi>.....14</bdi></div></div></div>
                    <div><div class="sub-sub table-of-content-sub-header-item"> <div >2.2.2 Indirect emissions ........................................................................................................................................................................</div><div ><bdi>.....14</bdi></div></div></div>

                    <div class="table-of-content-header-item"><div >3 QUANTIFICATION OF GHG EMISSIONS AND REMOVALS.................................................................................................................................................................</div><div ><bdi>.....16</bdi></div> </div>
                    <div class="table-of-content-sub-header-item"><div >3.1 Methodology ............................................................................................................................................................................</div><div ><bdi>.................16</bdi></div> </div>
                    <div class="table-of-content-sub-header-item"><div >3.2 Emission factors and other constants ......................................................................................................................................................</div><div ><bdi>.................19</bdi></div> </div>
                   
                  </div>
               
               
               </div>
            
               <div  class="footer">
                  <div class="row ">
                      <div style="background-color: #082160;" class="col-4"></div>
                      <div style="background-color: green;" class="col-4"></div>
                      <div style="background-color: yellow;" class="col-4"></div>
                  </div>
                  <div class="row ">
                      <div class="col-2 align-self-center">5 | Page</div>
                      <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                      <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
                  </div>
                  
      
               </div>
                </div>


                <div id="page_6" class="page text-center" >
                <div class="header">
                 <div class="row ">
                   
                   <div class="col-8 align-self-center">
                       Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
                   </div>
                   <div class="col-4 align-self-center">
                       <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
                   </div>
                 </div>
                 <div  class="row">
       
                 </div>
       
                </div>
                <div class="content">
                <div class="table-of-content ">
                
                <div class="table-of-content-sub-header-item"><div >3.3 Uncertainties .......................................................................................................................................................................</div><div ><bdi>................21</bdi></div> </div>
                <div class="table-of-content-sub-header-item"><div >3.4 Exclusions ..........................................................................................................................................................................</div><div ><bdi>.................23</bdi></div> </div>
                <div class="table-of-content-header-item"><div >4 RESULTS: EVALUATION OF GREENHOUSE GAS INVENTORY ...........................................................................................................................................</div><div ><bdi>................24</bdi></div> </div>
                <div class="table-of-content-sub-header-item"><div >4.1 Direct GHG emissions ................................................................................................................................................................</div><div ><bdi>.................26</bdi></div> </div>
                <div class="table-of-content-sub-header-item"><div >4.2 Indirect GHG emissions ............................................................................................................................................................</div><div ><bdi>.................27</bdi></div> </div>
                <div class="table-of-content-header-item"><div >5 COMPARISON OF CARBON FOOTPRINT OF 2020 WITH THE BASE YEAR ...............................................................................................................................</div><div ><bdi>................29</bdi></div> </div>
                <div class="table-of-content-sub-header-item"><div >5.1 Comparison of organizational GHG emissions ........................................................................................................................................</div><div ><bdi>.................29</bdi></div> </div>
                <div class="table-of-content-sub-header-item"><div >5.2 Comparison of organizational carbon footprint over the years .......................................................................................................................</div><div ><bdi>.................30</bdi></div> </div>
                <div class="table-of-content-sub-header-item"><div >5.3 Comparison of direct GHG emissions over the years ................................................................................................................................</div><div ><bdi>.................31</bdi></div> </div>
                <div class="table-of-content-sub-header-item"><div >5.4 Comparison of indirect GHG emissions over the years ................................................................................................................................</div><div ><bdi>.................32</bdi></div> </div>
                <div class="table-of-content-sub-header-item"><div >5.5 Comparisons of emission factors & other constant ..............................................................................................................................</div><div ><bdi>.................32</bdi></div> </div>
                <div class="table-of-content-sub-header-item"><div >5.6 Comparisons of per capita emission and emission intensity ...............................................................................................................................</div><div ><bdi>.................33</bdi></div> </div>
                <div class="table-of-content-header-item"><div >6 CONCLUSION .......................................................................................................................................................................................</div><div ><bdi>................34</bdi></div> </div>
                <div class="table-of-content-header-item"><div >7 RECOMMENDATIONS ...........................................................................................................................................................................</div><div ><bdi>................35</bdi></div> </div>
                <div class="table-of-content-sub-header-item"><div >7.1 Information management system .................................................................................................................................................................</div><div ><bdi>................35</bdi></div> </div>
                <div class="table-of-content-header-item"><div >8 ONGOING GHG MITIGATION AND REMOVAL ENHANCEMENT PROJECTS OF THE BANK.................................................................................................................................................................</div><div ><bdi>................36</bdi></div> </div>
                <div class="table-of-content-header-item"><div >9 NEXT STEPS .......................................................................................................................................................................................</div><div ><bdi>................37</bdi></div> </div>
                <div class="table-of-content-header-item"><div >ANNEX 1 .......................................................................................................................................................................................</div><div ><bdi>................38</bdi></div> </div>
              </div>
             
                </div>
             
                <div  class="footer">
                   <div class="row ">
                       <div style="background-color: #082160;" class="col-4"></div>
                       <div style="background-color: green;" class="col-4"></div>
                       <div style="background-color: yellow;" class="col-4"></div>
                   </div>
                   <div class="row ">
                       <div class="col-2 align-self-center">6 | Page</div>
                       <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                       <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
                   </div>
                   
       
                </div>
                 </div>
                




                <div id="page_7" class="page text-center" >
                <div class="header">
                 <div class="row ">    
                   <div class="col-8 align-self-center">
                       Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
                   </div>
                   <div class="col-4 align-self-center">
                       <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
                   </div>
                 </div>
                 <div  class="row">
                 </div>
                </div>
                <div class="content">
                <div class="list-of-content ">
                <div  class="list-of-content-main-headers text-start">List of Tables</div> 
                <div class="list-of-content-header-item"><div >Table 1: Activity data used for quantifying GHGs. ......................................................................................................................................................................</div><div ><bdi>.....17</bdi></div> </div>
                <div class="list-of-content-header-item" ><div >Table 2: Emission factors and other constants used for quantifying GHGs .............................................................................................................................</div><div ><bdi>.....19</bdi></div> </div>
                <div class="list-of-content-header-item"><div >Table 3: List of excluded emission sources.........................................................................................................................................................................</div><div ><bdi>.....23</bdi></div> </div>
                <div class="list-of-content-header-item"><div >Table 4: List of excluded emission sources...................................................................................................................................................................................</div><div ><bdi>.....24</bdi></div> </div>
                <div class="list-of-content-header-item"><div >Table 5: Direct emissions for inventory year 2020...........................................................................................................................................................</div><div ><bdi>.....26</bdi></div> </div>
                <div class="list-of-content-header-item"><div >Table 6: Indirect emissions for inventory year 2020 .................................................................................................................................................................................................</div><div ><bdi>.....27</bdi></div> </div>
                <div class="list-of-content-header-item"><div >Table 7: Comparison of GHG inventories over the years ........................................................................................................................................................</div><div ><bdi>.....29</bdi></div> </div>
                <div class="list-of-content-header-item"><div >Table 8: Comparison of emission factor of grid electricity and T&D loss ........................................................................................................................................</div><div ><bdi>.....33</bdi></div> </div>

                </div>
                <div class="spacer"></div>

                    
                <div class="list-of-content ">
                  <div  class="list-of-content-main-headers text-start">List of Figures</div> 
                  <div class="list-of-content-header-item"><div >Figure 1: GHG emissions for inventory year 2020 ..........................................................................................................................................................................................................</div><div ><bdi>.....3</bdi></div> </div>
                  <div class="list-of-content-header-item" ><div >Figure 2: GHG emissions by source...................................................................................................................................................................................................................</div><div ><bdi>.....4</bdi></div> </div>
                  <div class="list-of-content-header-item"><div >Figure 3: Direct and Indirect GHG emission sources selected for the inventory ........................................................................................................................................................................</div><div ><bdi>.....15</bdi></div> </div>
                  <div class="list-of-content-header-item"><div >Figure 4: Direct emissions by source..................................................................................................................................................................................</div><div ><bdi>.....26</bdi></div> </div>
                  <div class="list-of-content-header-item"><div >Figure 5: Indirect Emissions by sources .................................................................................................................................................................................</div><div ><bdi>.....28</bdi></div> </div>
                  <div class="list-of-content-header-item"><div >Figure 6: Comparison of overall emissionsover the years..................................................................................................................................................................................................</div><div ><bdi>.....30</bdi></div> </div>
                  <div class="list-of-content-header-item"><div >Figure 7: Comparison of direct emissions over the years ............................................................................................................................................................</div><div ><bdi>.....31</bdi></div> </div>
                  <div class="list-of-content-header-item"><div >Figure 8: Comparison of Indirect emissions over the years ..................................................................................................................................................</div><div ><bdi>.....32</bdi></div> </div>
                  <div class="list-of-content-header-item"><div >Figure 9: Comparison of per capita emission over the years ...............................................................................................................................................................</div><div ><bdi>.....33</bdi></div> </div>
                  <div class="list-of-content-header-item"><div >Figure 10: Comparison of emission intensity over the years ............................................................................................................................................................</div><div ><bdi>.....34</bdi></div> </div>
                  
                </div>
             
                
                
                </div>
                <div  class="footer">
                   <div class="row ">
                       <div style="background-color: #082160;" class="col-4"></div>
                       <div style="background-color: green;" class="col-4"></div>
                       <div style="background-color: yellow;" class="col-4"></div>
                   </div>
                   <div class="row ">
                       <div class="col-2 align-self-center">7 | Page</div>
                       <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                       <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
                   </div>
                </div>
                 </div>




                 <div id="page_8" class="page text-center" >
                 <div class="header">
                  <div class="row ">
                    <div class="col-8 align-self-center">
                        Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
                    </div>
                    <div class="col-4 align-self-center">
                        <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
                    </div>
                  </div>
                  <div  class="row"></div>
                </div>
                 <div class="content">

                 <div class="table-header text-start">
                 Glossary of terms
                </div>
               <div class="report-table-sm">
                            <figcaption class="figure-caption-table figure-caption text-start">Table 5: Direct emissions for inventory year 2020</figcaption>
                            <table class="table  table-bordered border-dark">
                              <thead class="table-primary  border-dark">
                                <tr>
                                  <th scope="col">GHG emission source</th>
                                  <th scope="col">Description</th>
                                  
                                </tr>
                              </thead>
                              <tbody class="table-active">
                                <tr>
                                  <td>Business air travel</td>
                                  <td>Indirect GHG emission source attributed to the business air travels Indirect GHG emission source attributed to the business air travels</td>
                                 
                                </tr>
                                <tr>
                                  <td>Company owned
                                    vehicles</td>
                                  <td>Direct GHG emission source attributed to company own motor bikes, cars, vans, and lorries</td>
                                 
                                </tr>
                                <tr>
                                  <td>Employeecommuting not paid by the company</td>
                                  <td>Indirect GHG emission source attributed to diesel and petrol consumption of the private and public vehicles use for employee commuting which don't receive payment for fuel</td>
                                </tr>
                                <tr>
                                  <td>Employee transport
                                    paid by the company</td>
                                  <td>Direct GHG emission source attributed to diesel and petrol consumption of the private and public vehicles use for employee commuting which receive payment for fuel</td>
                                </tr>
                                <tr>
                                  <td>Fire extinguishers</td>
                                  <td>Direct GHG emission source attributed to use of fire extinguisher</td>
                                </tr>
                                <tr>
                                  <td>Grid connected

                                    electricity</td>
                                  <td>Indirect GHG emission source attributed to use of electricity transmitted and distributed by Ceylon electricity board</td>
                                </tr>
                                <tr>
                                  <td>LPG</td>
                                  <td>Direct GHG emission source attributed to the LPG burning</td>
                                </tr>
                                <tr>
                                  <td>Municipal water</td>
                                  <td>Indirect emission source attributed to municipal water consumption</td>
                                </tr>

                                <tr>
                                <td>Refrigerant leakages</td>
                                <td>Direct GHG emission source attributed to refrigerant leakage</td>
                                </tr>
                                <tr>
                                <td>Stand by diesel generators</td>
                                <td>Direct GHG emission source attributed to use of diesel in generators</td>
                                </tr>
                                <tr>
                                <td>Transmission and distribution (T&D)  loss</td>
                                <td>Indirect GHG emission source attributed to the transmission and distribution loss of electricity</td>
                                </tr>
                                <tr>
                                <td>Paper waste disposal</td>
                                <td>Indirect GHG emission source attributed to the disposal of paper waste</td>
                                </tr>
                               



                              </tbody>
                            </table>
                          </div>
                 
                 
                 </div>
              
                 <div  class="footer">
                    <div class="row ">
                        <div style="background-color: #082160;" class="col-4"></div>
                        <div style="background-color: green;" class="col-4"></div>
                        <div style="background-color: yellow;" class="col-4"></div>
                    </div>
                    <div class="row ">
                        <div class="col-2 align-self-center">8 | Page</div>
                        <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                        <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
                    </div>
                  </div>
                </div>


                <div id="page_9" class="page text-center" >
                <div class="header">
                 <div class="row ">
                   <div class="col-8 align-self-center">
                       Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
                   </div>
                   <div class="col-4 align-self-center">
                       <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
                   </div>
                 </div>
                 <div  class="row"></div>
               </div>
                <div class="content">
                <div  class="main_header text-start">1 INTRODUCTION</div>
                <blockquote class=" paragraph blockquote text-start ">
                  <p class="mb-0 lh-base">Global warming negatively affects the environment in different ways such
                     as degradation and loss of biodiversity,
                     melting of glaciers and sea level rise, extinction of species and cause a huge risk to human wellbeing. </p>
                </blockquote>
                <blockquote class=" paragraph blockquote text-start ">
                  <p class="mb-0 lh-base">Quantification of GHGs released by an industry or
                     organization is now appeared as the best practice to take the corrective actions to mitigate the adverse effects of climate change.
                     Quantification of Carbon footprint provides number of key benefits to the organization, among others, it:</p>
                </blockquote>

              <div class="list">  
                <ul>
                <li><blockquote class="blockquote  ">
                  <p class="mb-0 lh-base">Provides a good understanding on impacts on climate change;</p>
                </blockquote></li>
                <li><blockquote class="blockquote  ">
                  <p class="mb-0 lh-base">Develops key performance indicators for emission and energy management;</p>
                </blockquote></li>
                <li><blockquote class="blockquote  ">
                  <p class="mb-0 lh-base">Maintains a higher rank among other competitive industries showing its commitment towards sustainable business;</p>
                </blockquote></li>
                <li><blockquote class="blockquote  ">
                  <p class="mb-0 lh-base">Meets stakeholders demand to address the imperative corporate responsibility of environmental conservation; and</p>
                </blockquote></li>
                <li><blockquote class="blockquote  ">
                  <p class="mb-0 lh-base">Develops Carbon management plan to make real emission reduction through supply chain and production.</p>
                </blockquote></li>  
              </ul>
            </div>

            <blockquote class=" paragraph blockquote text-start ">
              <p class="mb-0 lh-base">The GHG Inventory Report (“the report”) quantifies and reports the 
                GHG emissions under the financial control of Commercial Bank of Ceylon PLC (“The Bank”). 
                The report has been prepared and submitted in line with Climate Smart Initiatives (Pvt) Ltd 
                (“ClimateSI”)’s proposal number ClimateSI/MRV/2020/07, dated 31st July 2019 and various
                 discussions held between the Bank and ClimateSI.</p>
            </blockquote>
            <blockquote class=" paragraph blockquote text-start ">
              <p class="mb-0 lh-base">The time period of the report is from 01st January 2020 – 31st 
                December 2020 (the inventory year - IY 2020). The organizational
                 Carbon footprint is calculated based on the activity data provided by the Bank.</p>
            </blockquote>
            <blockquote class=" paragraph blockquote text-start ">
            <p class="mb-0 lh-base">Principles of the ISO standard (ISO 14064‐1 ‐2018 “Specification with guidance at
               the organizational level for the quantification and reporting of greenhouse gas emissions and removals”)
                were applied while quantifying and reporting the Greenhouse Gas (GHG) emissions.</p>
          </blockquote>

             
                
                
                </div>
             
                <div  class="footer">
                   <div class="row ">
                       <div style="background-color: #082160;" class="col-4"></div>
                       <div style="background-color: green;" class="col-4"></div>
                       <div style="background-color: yellow;" class="col-4"></div>
                   </div>
                   <div class="row ">
                       <div class="col-2 align-self-center">9 | Page</div>
                       <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                       <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
                   </div>
                 </div>
               </div>

               <div id="page_10" class="page text-center" >
               <div class="header">
                <div class="row ">
                  <div class="col-8 align-self-center">
                      Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
                  </div>
                  <div class="col-4 align-self-center">
                      <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
                  </div>
                </div>
                <div  class="row"></div>
              </div>
               <div class="content">
               
               <div  class="main_header_sub text-start">1.1 Introduction to the organization</div>
               <blockquote class=" paragraph blockquote text-start ">
               <p class="mb-0 lh-base">Commercial Bank PLC is the largest private sector Commercial Bank and the third largest Bank in Sri Lanka in terms of total assets. The Bank is committed to sustainability of operations by mitigating any adverse effects on the environment. By taking proactive steps to measure, manage, report and reduce its GHG emissions, the Bank is demonstrating the leadership and commitment to address the risks associated with climate change.</p>
             </blockquote>
             <div  class="main_header_sub text-start">1.2 Persons responsible</div>
             <blockquote class=" paragraph blockquote text-start ">
             <p class="mb-0 lh-base">
             AGM- Services and the Executive officer (Eng.) of the Premises Department are responsible for conducting the GHG inventory of the Bank.
             </p>
           </blockquote>
           <div  class="main_header_sub text-start">1.3 Purpose of the report</div>
           <blockquote class=" paragraph blockquote text-start ">
           <p class="mb-0 lh-base">
           This GHG Inventory quantifies the Bank’s total GHG emissions for the IY 2020, by accurately measuring 
           the GHG emissions associated with its operations. The main purpose of this report is to figure out the 
           amount of GHG emissions during the year. Also, this detail assessment helps the company to set the targets on 
           GHG emissions and emission removal for the next inventory year or years to reduce their GHG emissions. 
           This report will communicate the success of the efforts of
            the Bank to reduce the organizational GHG emissions to the internal and external stakeholders.          
             </p>
             </blockquote>

             <div  class="main_header_sub text-start">1.4 Intended users</div>   
             <blockquote class=" paragraph blockquote text-start ">
             <p class="mb-0 lh-base">
             The management team of the Bank may use the details of the report to make policy decisions which will 
             lead the organization to a sustainable development pathway. Further, the employees and other 
             stakeholders may use the details to identify their contribution to the organization carbon footprint and also
              to take acltions to emissions reduction.        
               </p>
               </blockquote>  

               <div  class="main_header_sub text-start">1.5 Dissemination policy</div>   
               <blockquote class=" paragraph blockquote text-start ">
               <p class="mb-0 lh-base">
               The Bank measures and reports its GHG emissions voluntarily since 2017 even without a 
               dissemination policy in place for the GHG inventory. Annual reports 
               will include the detail of GHG emissions and disseminate among the stakeholders.       
                 </p>
                 </blockquote>  



               </div>
            
               <div  class="footer">
                  <div class="row ">
                      <div style="background-color: #082160;" class="col-4"></div>
                      <div style="background-color: green;" class="col-4"></div>
                      <div style="background-color: yellow;" class="col-4"></div>
                  </div>
                  <div class="row ">
                      <div class="col-2 align-self-center">10 | Page</div>
                      <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                      <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
                  </div>
                </div>
              </div>

              <div id="page_11" class="page text-center" >
              <div class="header">
               <div class="row ">
                 <div class="col-8 align-self-center">
                     Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
                 </div>
                 <div class="col-4 align-self-center">
                     <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
                 </div>
               </div>
               <div  class="row"></div>
             </div>
              <div class="content">
              
        
               <div  class="main_header_sub text-start">1.6 Reporting period and frequency of reporting</div>   
               <blockquote class=" paragraph blockquote text-start ">
               <p class="mb-0 lh-base">
               This report quantifies the GHG emissions resulted in the inventory year 2020 
               (01st January 2020- 31st December 2020). The Bank will conduct
                the assessment annually as a best practice in moving towards sustainability.      
                 </p>
                 </blockquote>  
           
                 <div  class="main_header_sub text-start">1.7 Base year</div>   
              <blockquote class=" paragraph blockquote text-start ">
              <p class="mb-0 lh-base">
              This is the third attempt to quantify the carbon footprint taking into account all direct and indirect emissions in line 
              with ISO 14064-1 standard. Therefore, year 2017 will be considered as the base year.      
                </p>
                </blockquote>  

                
               <div  class="main_header_sub text-start">1.8 Data and information (List of GHGs account)</div>   
               <blockquote class=" paragraph blockquote text-start ">
               <p class="mb-0 lh-base">
               Greenhouse Gas emissions assessment quantifies the total GHGs produced directly and 
               indirectly from an organization’s activities within a specified period. It quantifies 
               all seven greenhouse gases where applicable and measures in units of carbon dioxide equivalent, 
               or CO₂e. The seven gases are Carbon Dioxide (CO₂), Methane (CH₄) Nitrous Oxide (N₂O), 
               Hydrofluorocarbons (HFCs), Sulphur hexafluoride (SF₆), Perfluorocarbons (PFCs) and Nitrogen 
               Trifluoride (NF₃), which are identified by the Kyoto Protocol as most harmful gases that 
               have major impact on climate change and compulsory to report under ISO 14064-1:2018.      
                 </p>
                 </blockquote>  
              
              </div>
           
              <div  class="footer">
                 <div class="row ">
                     <div style="background-color: #082160;" class="col-4"></div>
                     <div style="background-color: green;" class="col-4"></div>
                     <div style="background-color: yellow;" class="col-4"></div>
                 </div>
                 <div class="row ">
                     <div class="col-2 align-self-center">11 | Page</div>
                     <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                     <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
                 </div>
               </div>
             </div>


             <div id="page_12" class="page text-center" >
             <div class="header">
              <div class="row ">
                <div class="col-8 align-self-center">
                    Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
                </div>
                <div class="col-4 align-self-center">
                    <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
                </div>
              </div>
              <div  class="row"></div>
            </div>
             <div class="content">
              <div  class="main_header text-start">2 BOUNDARIES</div>
              <blockquote class=" paragraph blockquote text-start ">
              <p class="mb-0 lh-base">
              The first step in calculation of carbon footprint is to set the boundary.
               This is important as it determines which sources and sinks of the organization
               must be included in the footprint calculation and which are to be excluded.     
                </p>
                </blockquote>  
          

                <div  class="main_header_sub text-start">2.1 Setting up the organizational boundaries</div>   
                <blockquote class=" paragraph blockquote text-start ">
                <p class="mb-0 lh-base">
                ISO 14064-1:2018 standard allows the setting of organizational boundaries on either 
                the control approach or the equity shareholding approach. According to the control 
                approach, all emissions and removals from the facilities over which it has financial 
                or operational control should be accounted. According to the shareholding approach, 
                emissions of the entities in which the 
                organization has a share must be counted in proportionate to the shareholding.      
                  </p>
                  </blockquote>  

                  <div  class="main_header_sub_sub text-start">2.1.1 Control approac</div>
                  <blockquote class=" paragraph blockquote text-start ">
                  <p class="mb-0 lh-base">
                  Under the control approach, each entity accounts for 100 percent of the GHG emissions from operations 
                  over which it has control. It does not account for GHG emissions from operations where it has an 
                  interest but has no control. Control can be defined either financial or operational terms. When using 
                  the control approach to consolidate GHG emissions, companies shall choose between either the operational 
                  control or financial control criteria. Financial control was selected as the control approach for this study. 
                  As such, organizational boundary chosen for calculating the carbon footprint for the inventory year 2020 was 
                  head office, 268 branches island wide, holiday homes, quarters1. Even though Bank has three overseas branches in Bangladesh, 
                  Maldives, and Myanmar those were not considered for the assessment.     
                    </p>
                    </blockquote>  
                    <div  class="main_header_sub text-start">2.2 Reporting boundaries</div>   
                    <blockquote class=" paragraph blockquote text-start ">
                    <p class="mb-0 lh-base">
                    Under the reporting boundaries organization shall establish and document the direct and indirect GHG emissions and
                     removals associated with the organization’s operations.    
                      </p>
                      </blockquote>  

                    <div class="more-info ">
                    <hr>
                      <p class="mb-0 text-start fw-light lh-sm"><small> 1 If only branch pays for electricity, water, or LPG.</small></p>
                      </div>
                   
             
             </div>
          
             <div  class="footer">
                <div class="row ">
                    <div style="background-color: #082160;" class="col-4"></div>
                    <div style="background-color: green;" class="col-4"></div>
                    <div style="background-color: yellow;" class="col-4"></div>
                </div>
                <div class="row ">
                    <div class="col-2 align-self-center">12 | Page</div>
                    <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                    <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
                </div>
              </div>
            </div>

            <div id="page_13" class="page text-center" >
            <div class="header">
             <div class="row ">
               <div class="col-8 align-self-center">
                   Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
               </div>
               <div class="col-4 align-self-center">
                   <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
               </div>
             </div>
             <div  class="row"></div>
           </div>
            <div class="content">
            <div  class="main_header_sub_sub text-start">2.2.1 Direct GHG emissions</div>
            <blockquote class=" paragraph blockquote text-start ">
            <p class="mb-0 lh-base">
            Direct GHG emissions are the emissions from the GHG sources owned or controlled by 
            the organization. Direct GHG emissions 
            should be quantified and reported separately for all GHGs in tonnes of CO₂e.     
              </p>
              </blockquote> 
              <div  class="main_header_sub_sub text-start">2.2.2 Indirect emissions</div>
              <blockquote class=" paragraph blockquote text-start ">
              <p class="mb-0 lh-base">
              Indirect emissions are the GHG emissions that occur as consequences of an organization’s 
              operations and activities but that arises from the GHG sources that are not owned or controlled 
              by the organization and quantified and reported separately for all GHGs in tonnes of CO₂e. 
              These indirect emissions have been selected according to the materiality to the company operations.
               Within the financial boundary of the Bank, the emissions associated with the following activities were quantified and reported. 
              Indirect emissions which is less than 1tCO₂e will not be taken in to account.     
                </p>
                </blockquote> 
            
                <div style="margin-top: 50px;" class="image-larg-hight "><figure class="figure ">
                <img src="http://localhost:7080/report/figures/figure3.png" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
                <figcaption class="figure-caption">Figure 3: Direct and Indirect GHG emission sources selected for the inventory</figcaption>
              </figure></div>
            </div>
         
            <div  class="footer">
               <div class="row ">
                   <div style="background-color: #082160;" class="col-4"></div>
                   <div style="background-color: green;" class="col-4"></div>
                   <div style="background-color: yellow;" class="col-4"></div>
               </div>
               <div class="row ">
                   <div class="col-2 align-self-center">13 | Page</div>
                   <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                   <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
               </div>
             </div>
           </div>


           <div id="page_14" class="page text-center" >
           <div class="header">
            <div class="row ">
              <div class="col-8 align-self-center">
                  Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
              </div>
              <div class="col-4 align-self-center">
                  <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
              </div>
            </div>
            <div  class="row"></div>
          </div>
           <div class="content">
           <div  class="main_header text-start">3 QUANTIFICATION OF GHG EMISSIONS AND REMOVALS<sup>2</sup></div>
           <blockquote class=" paragraph blockquote text-start ">
           <p class="mb-0 lh-base">
           This is the fourth consecutive year for which the GHG emissions were quantified 
           in accordance with ISO 14064-1. This leads to a more complete reporting of the Bank’s GHG emissions.
            All GHG sources were identified in consultation with the Bank. The identified, categorized emission 
           sources can be seen in section 2.2 (“Reporting Boundaries”) of this report.    
             </p>
             </blockquote>  
       
             <div  class="main_header_sub text-start">3.1 Methodology</div>   
             <blockquote class=" paragraph blockquote text-start ">
             <p class="mb-0 lh-base">
             The main greenhouse gases are Carbon dioxide, Methane and Nitrous oxide. Carbon dioxide is associated with 
             electricity and fuel consumption. Methane and Nitrous oxide are formed in small quantities from the 
             combustion of diesel and petrol. As per international protocol, all the greenhouse gases (GHGs) 
             are converted to carbon dioxide equivalent using global warming potentials (GWP) as per the IPCC 5th assessment report 
             (CO₂ -1, CH₄ -28, N₂O- 265). GHG reporting is done as Carbon Dioxide equivalent (CO₂e).   
               </p>
               </blockquote>  
               <blockquote class=" paragraph blockquote text-start ">
               <p class="mb-0 lh-base">
               All calculations were carried out based on GHG activity data multiplied by an appropriate GHG emission 
               factor. Unless stated otherwise, all emission factors were obtained from the Inter-governmental Panel on Climate Change (IPCC). This approach makes it easier to compare the
                carbon footprint calculated in this report with other similar reports.   
                 </p>
                 </blockquote>  
                 <blockquote class=" paragraph blockquote text-start ">
                 <p class="mb-0 lh-base">
                 Collection of activity data was primarily done through the central data base, invoices, 
                 logbooks and utility bills. Then those were fed into the ‘Smart Carbon Calculator’ by the respective officers
                  of the Bank. All these hard copies of GHG records will be kept at least for 2 years before archiving. Availability of the softcopy 
                 has no time limit. To avoid the double counting data discrepancy patterns of changes were monitored. 
                 When uncertainties arise, sample surveys were carried out to get the real image. 
                   </p>
                   </blockquote>  

                   <blockquote class=" paragraph blockquote text-start ">
                   <p class="mb-0 lh-base">
                   The Bank may decide to get the overall footprint verified by an independent 
                   third-party verification body and get the reasonable assurance
                    that its carbon footprint for the year 2020 is not materially misstated.
                     </p>
                     </blockquote>  


                     <blockquote class=" paragraph blockquote text-start ">
                     <p class="mb-0 lh-base">
                     Activity data used to assess the GHG emissions attributed to the Bank and the source of the data are given in the Table 1.
                       </p>
                       </blockquote>  


                   <div class="more-info ">
                   <hr>
                     <p class="mb-0 text-start fw-light lh-sm"><small> 
                     2 Removals has not been considered.
                      </small></p>     
                  </div>
           
           </div>
        
           <div  class="footer">
              <div class="row ">
                  <div style="background-color: #082160;" class="col-4"></div>
                  <div style="background-color: green;" class="col-4"></div>
                  <div style="background-color: yellow;" class="col-4"></div>
              </div>
              <div class="row ">
                  <div class="col-2 align-self-center">14 | Page</div>
                  <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                  <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
              </div>
            </div>
          </div>

          <div id="page_15" class="page text-center" >
          <div class="header">
           <div class="row ">
             <div class="col-8 align-self-center">
                 Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
             </div>
             <div class="col-4 align-self-center">
                 <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
             </div>
           </div>
           <div  class="row"></div>
         </div>
          <div class="content">
          <div class="report-table-sm">
          <figcaption class="figure-caption-table figure-caption text-start">Table 5: Direct emissions for inventory year 2020</figcaption>
          <table class="table  table-bordered border-dark">
            <thead class="table-primary  border-dark">
              <tr>
                <th  rowspan="2" colspan="2" scope="col">Category</th>
                <th  colspan="2"  scope="col">Activity Data</th>
                <th  rowspan="2" scope="col">Reference Data source</th>
                
                
              </tr>
              <tr>
                
                <th scope="col">Quantity</th>
                <th scope="col">Unit</th>
               
                
              </tr>
            </thead>
            <tbody class="table-active">
              <tr>
                <td colspan="2" >Grid connected electricity</td>
                <td>12.83</td>
                <td>GWh/year</td>
                <td>Central Accounts of the Bank</td>
              </tr>

              <tr>
                <td colspan="2" >Stand by Generators (Diesel) 3</td>
                <td>89.29</td>
                <td>m3/yea</td>
                <td>Central Accounts of the Bank</td>
                

               
              </tr>



              <tr>
                <td rowspan="2" >Refrigerant Leakages</td>
                <td>R22</td>
                <td>121</td>
                <td rowspan="2">kg/year</td>
                <td rowspan="2">Premises Department</td>
                
              </tr>
              <tr>
                <td>R410a</td>
                <td>11.5</td>
              </tr>
              


              <tr>
                <td colspan="2" >Fire Extinguishers (CO₂)</td>
                <td>1.40</td>
                <td>t/year</td>
                <td>Security logbook</td>
              </tr>



              <tr>
                <td rowspan="2" >Company owned vehicles</td>
                <td>Petrol<sup>2</sup></td>
                <td>121</td>
                <td rowspan="2">m3/year</td>
                <td rowspan="2">Central Accounts of the Bank</td>
                
              </tr>
              <tr>
                <td>Diesel<sup>2</sup></td>
                <td>8.58</td>
              </tr>
             



              <tr>
                <td colspan="2" >Business air travels</td>
                <td>Departure, Destination Country, One way/ Round Trip,Transit Air ports, Cabin class</td>
                <td>-</td>
                <td>Logistic Department</td>
              </tr>

              <tr>
              <td colspan="2" >LPG Usage</td>
              <td>1012.50</td>
              <td>kg/year</td>
              <td>Central Accounts of the Bank</td>
            </tr>
            
            <tr>
            <td rowspan="2" >Employee commuting<sup>4</sup> (Paid by the company)</td>
            <td>Petrol</td>
            <td>6.00</td>
            <td rowspan="2">m3/year</td>
            <td rowspan="2">Central accounts of the Bank</td>
            
             </tr>
            <tr>
              <td>Diesel</td>
              <td>0.52</td>
            </tr>

            <tr>
            <td rowspan="2" >Employee commuting<sup>3</sup> (Not paid by the company)</td>
            <td>Petrol</td>
            <td>41.43</td>
            <td rowspan="2">m3/year</td>
            <td rowspan="2">Survey</td>
            
             </tr>
            <tr>
              <td>Diesel</td>
              <td>5.17</td>
            </tr>
            <tr>
            <td rowspan="2" >Hired vehicl</td>
            <td>Petrol</td>
            <td>138.23</td>
            <td rowspan="2">m3/month</td>
            <td rowspan="2">Central Accounts of the Bank</td>
            
             </tr>
            <tr>
              <td>Diesel</td>
              <td>40.62</td>
            </tr>

            <tr>
            <td colspan="2" >Municipal Water</td>
            <td>38,893</td>
            <td>m3/year</td>
            <td>Central Accounts of the Bank & Water bills</td>
            </tr>
            <tr>
            <td colspan="2" >Paper waste</td>
            <td>99.95</td>
            <td>t/year</td>
            <td>Logistic Department</td>
            </tr>


        

            </tbody>
          </table>
        </div>
       
          
        <div class="more-info ">
        <hr>
        <p class="mb-0 text-start fw-light lh-sm"><small> 
        <sup>3</sup> These are calculated values from the monitory values of the original record
         </small></p>   
          <p class="mb-0 text-start fw-light lh-sm"><small> 
          <sup>4</sup> Only represent the data received from the survey sample
           </small></p>     
       </div>
          </div>
       
          <div  class="footer">
             <div class="row ">
                 <div style="background-color: #082160;" class="col-4"></div>
                 <div style="background-color: green;" class="col-4"></div>
                 <div style="background-color: yellow;" class="col-4"></div>
             </div>
             <div class="row ">
                 <div class="col-2 align-self-center">15 | Page</div>
                 <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                 <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
             </div>
           </div>
         </div>


         <div id="page_16" class="page text-center" >
         <div class="header">
          <div class="row ">
            <div class="col-8 align-self-center">
                Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
            </div>
            <div class="col-4 align-self-center">
                <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
            </div>
          </div>
          <div  class="row"></div>
        </div>
         <div class="content">
          <div  class="main_header_sub text-start">3.2 Emission factors and other constants</div>

          <blockquote class=" paragraph blockquote text-start ">
            <p class="mb-0 lh-base">Emission factors, unit cost, fuel economy values used in the calculation
             of GHG emissions attributed to different emission sources are given in Table 2.</p>
          </blockquote>
          <div class="report-table-sm">
          <figcaption class="figure-caption-table figure-caption text-start">Table 5: Direct emissions for inventory year 2020</figcaption>
          <table class="table  table-bordered border-dark">
            <thead class="table-primary  border-dark">
              <tr>
                <th  rowspan="2" colspan="2" scope="col">Fuel</th>
                <th  colspan="2"  scope="col">Emission Factor and constant</th>
                <th  rowspan="2" scope="col">Reference</th>
                
                
              </tr>
              <tr>
                
                <th scope="col">No</th>
                <th scope="col">Unit</th>
               
                
              </tr>
            </thead>
            <tbody class="table-active">
              <tr>
                <td colspan="2" >Diesel (Stationery Combustion)</td>
                <td>74.54</td>
                <td>tCO₂e/TJ</td>
                <td>http://www.ipcc-nggip.iges.or.jp/public/2006gl/pdf/2_Volume2/V2_2_Ch2_Stationary_Combustion.pdf</td>
              </tr>

              <tr>
                <td colspan="2" >Diesel (Mobile Combustion)</td>
                <td>75.24</td>
                <td>tCO₂e/TJ</td>
                <td>http://www.ipcc-nggip.iges.or.jp/public/2006gl/pdf/2_Volume2/V2_3_Ch3_Mobile_Combustion.pdf</td>  
              </tr>
              <tr>
              <td colspan="2" >Petrol (Mobile Combustion)</td>
              <td>71.07</td>
              <td>tCO₂e/TJ</td>
              <td>http://www.ipcc-nggip.iges.or.jp/public/2006gl/pdf/2_Volume2/V2_3_Ch3_Mobile_Combustion.pdf</td>  
              </tr>
              <tr>
              <td colspan="2" >Refrigerant Leakage (R 22)</td>
              <td>1,760</td>
              <td>GWP</td>
              <td>https://www.ipcc.ch/pdf/assessment-report/ar5/wg1/WG1AR5_Chapter08_FINAL.pdf</td>  
              </tr>
            
              <tr>
                <td rowspan="2" >Refrigera nt Leakage  (R 410a)</td>
                <td>CH2F2</td>
                <td>677</td>
                <td rowspan="2">GWP</td>
                <td rowspan="2">https://www.ipcc.ch/pdf/assessment-report/ar5/wg1/WG1AR5_Chapter08_FINAL.pdf</td>
                
              </tr>
              <tr>
                <td>CHF2CF3</td>
                <td>3170</td>
              </tr>

              <tr>
              <td colspan="2" >Municipal Water</td>
              <td>0.35</td>
              <td>kWh/m3</td>
              <td>http://www.climatechange.lk/Documents/A_Guide_for_Carbon_Footprint_Assessment.pdf</td>  
              </tr>

              <tr>
              <td colspan="2" >National Grid Emission Factor</td>
              <td>0.4694</td>
              <td>kgCO₂e/kWh</td>
              <td>http://www.energy.gov.lk/images/energy-balance/energy-balance-2018.pdf</td>  
              </tr>
              <tr>
              <td colspan="2" >Transmission & Distribution Loss</td>
              <td>9.08</td>
              <td>%</td>
              <td>https://ceb.lk/front_img/img_reports/1626946210CEB-Statistical_Digest-Form-2020-Web_Version.pdf</td>  
              </tr>
              <tr>
              <td colspan="2" >Paper waste recycling</td>
              <td>21.354</td>
              <td>kgCO₂/ tonne</td>
              <td>https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2020</td>  
              </tr>
              <tr>
              <td colspan="2" >Business air travels</td>
              <td></td>
              <td></td>
              <td>https://www.icao.int/environmental-protection/CarbonOffset/Pages/default.aspx</td>  
              </tr>
              <tr>
              <td colspan="2" >Unit cost for municipal water</td>
              <td>75</td>
              <td>LKR/m3</td>
              <td>The Bank</td>  
              </tr>
              
             

      


        

            </tbody>
          </table>
        </div>

         
         
         </div>
      
         <div  class="footer">
            <div class="row ">
                <div style="background-color: #082160;" class="col-4"></div>
                <div style="background-color: green;" class="col-4"></div>
                <div style="background-color: yellow;" class="col-4"></div>
            </div>
            <div class="row ">
                <div class="col-2 align-self-center">16 | Page</div>
                <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
            </div>
          </div>
        </div>


        <div id="page_17" class="page text-center" >
        <div class="header">
         <div class="row ">
           <div class="col-8 align-self-center">
               Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
           </div>
           <div class="col-4 align-self-center">
               <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
           </div>
         </div>
         <div  class="row"></div>
       </div>
        <div class="content">
        <div class="report-table-sm">
        <table class="table  table-bordered border-dark">
        <tbody class="table-active">
        
        <tr>
        <td rowspan="2" >Payment for hired  vehicles(employee)</td>
        <td>Executive</td>
        <td>30</td>
        <td rowspan="2">LKR/km</td>
        <td rowspan="2">The Bank</td>
        
        </tr>
        <tr>
          <td>Non-executive</td>
          <td>15</td>
        </tr>

        <tr>
        <td rowspan="4" >Payment for hired vehicles(third  parties)</td>
        <td>Partner 1<sup>5</sup></td>
        <td>48.42+VAT</td>
        <td rowspan="4">LKR/km</td>
        <td rowspan="4">The Bank</td>
          
        </tr>
        <tr>
          <td>Partner 2<sup>6</sup></td>
          <td>63.20+VAT</td>
        </tr>
        <tr>
          <td>Partner 3<sup>7</sup></td>
          <td>70</td>
        </tr>
        <tr>
          <td>Partner 4<sup>8</sup></td>
          <td>125</td>
        </tr>

        <tr>
        <td rowspan="4" >Fuel economy of hired vehicles</td>
        <td>Van</td>
        <td>10</td>
        <td rowspan="4">km/l</td>
        <td rowspan="4">The Bank</td>
          
        </tr>
        <tr>
          <td>Car</td>
          <td>20</td>
        </tr>
        <tr>
          <td>T/wheel</td>
          <td>17.6</td>
        </tr>
        <tr>
          <td>Boom truck</td>
          <td>4</td>
        </tr>

        <tr>
        <td rowspan="3" >Fuel economy of publicvehicles(Employee  commuting)</td>
        <td>Bus</td>
        <td>0.016</td>
        <td rowspan="3">kgCO₂e</td>
        <td rowspan="3">Indian GHG programme</td>
          
        </tr>
        <tr>
          <td>Train</td>
          <td>0.0079</td>
        </tr>
        <tr>
          <td>Staff van</td>
          <td>0.025</td>
        </tr>
      
        <tr>
        <td rowspan="3" >Fuel economy of private vehicles<sup>9</sup> (Employee commuting)</td>
        <td>Bike</td>
        <td>50</td>
        <td rowspan="3">km/L</td>
        <td rowspan="3">https://www.globalfueleconomy.org/media/461037/ asia_fuel-economy_sri-lanka_baseline.pdf   
        http://www.indiaenvironmentportal.org.in/files/file/ Iyer_two-three-wheelers_India.pdf   
        Opinion of sector experts
        </td>
          
        </tr>
        <tr>
          <td>Three wheel</td>
          <td>35</td>
        </tr>
        <tr>
          <td>Hybrid car</td>
          <td>22</td>
        </tr>
        
        
        
        </tbody>
        
        
        
        
        
        </table>
        
        
        
        
        
        
        </div>
     
        <div class="more-info ">
          <hr>
          <p class="mb-0 text-start fw-light lh-sm"><small> 
          5 CS Tours / Galle Taxi / Turpo Rent a Car/ Digital (hybrid cars)</small></p>   
          <p class="mb-0 text-start fw-light lh-sm"><small> 
          6 Kangaroo (hybrid cars)
          </small></p>     
          <p class="mb-0 text-start fw-light lh-sm"><small> 
          7 H A N Perera/ Skandy Tours/ Vasi (Van)
          </small></p>  
          <p class="mb-0 text-start fw-light lh-sm"><small> 
          8 Wickramarachchi (boom truck)
          </small></p>  
        </div>
        
        </div>
     
        <div  class="footer">
           <div class="row ">
               <div style="background-color: #082160;" class="col-4"></div>
               <div style="background-color: green;" class="col-4"></div>
               <div style="background-color: yellow;" class="col-4"></div>
           </div>
           <div class="row ">
               <div class="col-2 align-self-center">17 | Page</div>
               <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
               <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
           </div>
         </div>
       </div>

       
       <div id="page_18" class="page text-center" >
       <div class="header">
        <div class="row ">
          <div class="col-8 align-self-center">
              Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
          </div>
          <div class="col-4 align-self-center">
              <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
          </div>
        </div>
        <div  class="row"></div>
      </div>
       <div class="content">
       <div  class="main_header_sub text-start">3.3 Uncertainties</div>
       <div class="main_header_sub_sub-bold">Company own vehicles</div>
        <blockquote class=" paragraph blockquote text-start ">
          <p class="mb-0 lh-base">value. These were converted to volume using the respective unit cost of the fuel type. 
          As cost of fuel and amount of fuel are highly 
          corelated, this only add low level of uncertainty to the assessment.</p>
        </blockquote>

        
        <div class="main_header_sub_sub-bold">Stand by generators<sup>10</sup></div>
         <blockquote class=" paragraph blockquote text-start ">
           <p class="mb-0 lh-base">
           The Bank only records the data in monetary values. Therefore, fuel consumption was calculated based 
           on the unit cost of the diesel. As cost of fuel and 
           amount of fuel are highly corelated, this only add low level of uncertainty to the assessment.
           </p>
         </blockquote>

         
         <div class="main_header_sub_sub-bold">Employee commuting</div>
          <blockquote class=" paragraph blockquote text-start ">
            <p class="mb-0 lh-base">Transferring of the employees only take place within five years period.
             Therefore, GHG emissions attributed to employee commuting were calculated based on
             the data gathered in a survey conducted in 2017 (this data was verified by the verification body in that year). However, number of working days were considered as 70% that of in
              2017 based on the working arrangements of the Bank in 2020.</p>
          </blockquote>
          <blockquote class=" paragraph blockquote text-start ">
          <p class="mb-0 lh-base">Uncertainty of the assessment of this category is high as employees entered assumed data, drastic changes 
          in the commuting methods due to travel restrictions, etc.</p>
        </blockquote>
    
          <div class="main_header_sub_sub-bold">LPG</div>
          <blockquote class=" paragraph blockquote text-start ">
            <p class="mb-0 lh-base">Amount of LPG consumed in holiday homes and staff quarters were
             also calculated based on the attributed cost. Retail price of gas cylinder were used for the conversion. This may have also caused moderate uncertainty to assessment as fluctuations of retail
             price over the year and district wise changes of price were not considered.</p>
          </blockquote>
         
          <div class="more-info ">
          <hr>
          <p class="mb-0 text-start fw-light lh-sm"><small> 
          9 Unless use the vehicle specific value/given value by the Bank</small></p>   
          <p class="mb-0 text-start fw-light lh-sm"><small> 
          10 Only includes the Bank owned generators. Shared and outsourced generators are not included due to unavailability of the data and control. 
          Please see Annex I for the list of branches which operate without, shared or outsourced generators.
          </small></p>     
          
          
        </div>

       
       </div>
    
       <div  class="footer">
          <div class="row ">
              <div style="background-color: #082160;" class="col-4"></div>
              <div style="background-color: green;" class="col-4"></div>
              <div style="background-color: yellow;" class="col-4"></div>
          </div>
          <div class="row ">
              <div class="col-2 align-self-center">18 | Page</div>
              <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
              <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
          </div>
        </div>
      </div>
      


      
      <div id="page_19" class="page text-center" >
      <div class="header">
       <div class="row ">
         <div class="col-8 align-self-center">
             Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
         </div>
         <div class="col-4 align-self-center">
             <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
         </div>
       </div>
       <div  class="row"></div>
     </div>
      <div class="content">
      <div class="main_header_sub_sub-bold">Hired Vehicles</div>
      <blockquote class=" paragraph blockquote text-start ">
        <p class="mb-0 lh-base">Hired vehicles include two categories, vehicles hired from third parties 
        and vehicle hired from employees to uses for official purposes.</p>
      </blockquote>
      <blockquote class=" paragraph blockquote text-start ">
      <p class="mb-0 lh-base">The Bank, only keep monetary values paid for respective third-party companies. As such, those values were converted to distance based on the agreed cost per kilometer. These values were converted to volume of fuel
       based on the average fuel economy of respective vehicles as given in Table 2.</p>
      </blockquote>
      <blockquote class=" paragraph blockquote text-start ">
      <p class="mb-0 lh-base">Nonexecutives entitled to use own motor bike, or three wheels as hired vehicles.
       Cost attributed to each type were converted to fuel consumption based on entitle per capita cost and respective fuel economy of the vehicle. Please see Table 2 for more details. 
       Number of assumptions made might have added high uncertainty to the assessment.</p>
      </blockquote>

      <div class="main_header_sub_sub-bold">Municipal Water</div>
      <blockquote class=" paragraph blockquote text-start ">
        <p class="mb-0 lh-base">The Bank only record bill amount of the municipal water. As such bill amount was converted to consumption units of water based on unit cost and the attributed fixed charge.
         This might also have caused low level of uncertainty to the assessment.</p>
      </blockquote>
  
      
      
      </div>
   
      <div  class="footer">
         <div class="row ">
             <div style="background-color: #082160;" class="col-4"></div>
             <div style="background-color: green;" class="col-4"></div>
             <div style="background-color: yellow;" class="col-4"></div>
         </div>
         <div class="row ">
             <div class="col-2 align-self-center">19 | Page</div>
             <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
             <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
         </div>
       </div>
     </div>



     
     <div id="page_20" class="page text-center" >
     <div class="header">
      <div class="row ">
        <div class="col-8 align-self-center">
            Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
        </div>
        <div class="col-4 align-self-center">
            <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
        </div>
      </div>
      <div  class="row"></div>
    </div>
     <div class="content">
     <div  class="main_header_sub text-start">3.4 Exclusions</div>
      
     <blockquote class=" paragraph blockquote text-start ">
       <p class="mb-0 lh-base">Emissions attributed to indirect emission sources listed in Table 3 were excluded due to the unavailability of the
        sufficient data to quantify the GHG emissions.</p>
     </blockquote>
     <div class="report-table-sm">
     <figcaption class="figure-caption-table figure-caption text-start">Table 5: Direct emissions for inventory year 2020</figcaption>
     <table class="table  table-bordered border-dark">
       <thead class="table-primary  border-dark">
         <tr>
           <th scope="col">Emission source</th>
           <th scope="col">Reason</th>
           
         </tr>
       </thead>
       <tbody class="table-active">
         <tr>
           <td>Shared generators</td>
           <td>Due to unavailability of sufficient data to quantify the GHG emissions</td>
          
         </tr>
         <tr>
           <td>Locally transported material(stationary, water bottle, etc.)</td>
           <td>Due to unavailability of sufficient data to quantify the GHG emissions</td>
          
         </tr>
         <tr>
           <td>Emissions of client/guest transportation</td>
           <td>Due to unavailability of sufficient data to quantify the GHG emissions</td>
         </tr>
         <tr>
           <td>Waste Disposal (excluding paper waste)</td>
           <td>Due to unavailability of sufficient data to quantify the GHG emissions </td>
         </tr>
         <tr>
           <td>Waste transportation</td>
           <td>Due to unavailability of sufficient data to quantify the GHG emissions</td>
         </tr>
         
       </tbody>
     </table>
   </div>
  
     
     
     </div>
  
     <div  class="footer">
        <div class="row ">
            <div style="background-color: #082160;" class="col-4"></div>
            <div style="background-color: green;" class="col-4"></div>
            <div style="background-color: yellow;" class="col-4"></div>
        </div>
        <div class="row ">
            <div class="col-2 align-self-center">20 | Page</div>
            <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
            <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
        </div>
      </div>
    </div>



    
    <div id="page_21" class="page text-center" >
    <div class="header">
     <div class="row ">
       <div class="col-8 align-self-center">
           Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
       </div>
       <div class="col-4 align-self-center">
           <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
       </div>
     </div>
     <div  class="row"></div>
   </div>
    <div class="content">
    <div  class="main_header text-start">4 RESULTS: EVALUATION OF GREENHOUSE GAS INVENTORY</div>
    <blockquote class=" paragraph blockquote text-start ">
    <p class="mb-0 lh-base">Emissions attributed to direct and indirect emission sources categorized
     under category 1-6 are presented in Table under the respective GHG</p>
  </blockquote>
  <div class="report-table-sm">
  <figcaption class="figure-caption-table figure-caption text-start">Table 4: GHG Inventory for 2020</figcaption>
  <table class="table  table-bordered border-dark">
    <thead class="table-primary  border-dark">
      <tr>
        <th class="text-center"  colspan="7"  scope="col">GHG emissions 2020</th>
        
       
        
        
      </tr>
      <tr>
      <th scope="col">Category</th>
      <th scope="col">Emission Source</th>
        <th scope="col">tCO₂e</th>
        <th scope="col">CO₂</th>
        <th scope="col">CH₄</th>
        <th scope="col">N₂O</th>
        <th scope="col">HFCs</th>
       
        
      </tr>
    </thead>
    <tbody class="table-active">
      <tr>
        <td rowspan="6"  scope="row">Direct emissions</td>
        <td>Company own vehicles</td>  
        <td>412.90</td>
        <td>402.83</td>
        <td>5.10 </td>
        <td>4.97</td>
        <td>NO</td>
      </tr>
      <tr>    
        <td>Refrigerant Leakage</td>
        <td>235.08</td>
        <td>NO</td>
        <td>NO</td>
        <td>NO</td>
        <td>235.08</td>
      </tr>
      <tr>
        <td>Employee commuting (Paid)</td> 
        <td>186.07<sup>11</sup></td>
        <td>NA</td>
        <td>NA</td>
        <td>NA</td>
        <td>NO</td>
      </tr>
      <tr>
        <td>Stand by Generators</td>    
        <td>239.93</td>
        <td>238.52</td>
        <td>0.90</td>
        <td>0.51</td>
        <td>NO</td>
      </tr>
      <tr>
        <td>Fire extinguishers</td>
        <td>1.39</td>
        <td>1.39</td>
        <td>NO</td>
        <td>NO</td>
        <td>NO</td>
      </tr>
      <tr>
        <td>LPG</td>
        <td>3.03</td>
        <td>3.02</td>
        <td>0.01</td>
        <td>0.00</td>
        <td>NO</td>
      </tr>
      <tr>
        <td></td>
        <th>Total direct emissions<sup>12</sup></th>
        <th>1078.40</th>
        <th>645.77</th>
        <th>6.00</th>
        <th>5.48</th>
        <th>235.08</th>
      </tr>
      <tr>
        <td rowspan="4"  scope="row">Indirect emissions from imported energy</td>
        <td>Grid Connected Electricity</td>
        <td>6023.88</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td>Employee Commuting (Not paid)</td>
        <td>1320.45</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      <tr>   
        <td>Hired Vehicle</td>
        <td>436.93</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      <tr> 
        <td>Business Air Travels</td>
        <td>8.86</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td rowspan="2"  scope="row">4: Indirect emissions from services Used by the organization</td>
        <td>Paper waste recycle</td>
        <td>2.13</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td>Municipal Water</td>
        <td>18.26</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
     
    <tr>
    <td  scope="row">Indirect emissions from imported energy</td>
    <td>T&D loss</td>
    <td>601.59</td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  
      <tr>
        <td></td>
        <th>Total direct emissions</th>
        <th>8,412.10</th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
      </tr>
      <tr>
        
        <th colspan="2">Total GHG emissions</th>
        <th>9,490.50</th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
      </tr>




  


    </tbody>
  </table>
  <p class="mb-0 lh-base"><small>NA – Not Available NO – Not Occurring</small></p>
</div>
    <div class="more-info ">
    <hr>
    <p class="mb-0 text-start fw-light lh-sm"><small> 
    11 This was estimated based on a sample data set. Therefore, it is not possible to breakdown the emission</small></p>   
    <p class="mb-0 text-start fw-light lh-sm"><small> 
    12 Gas wise emission does not include the emissions attributed to employee commuting
    </small></p>     


    </div>
    
    </div>
 
    <div  class="footer">
       <div class="row ">
           <div style="background-color: #082160;" class="col-4"></div>
           <div style="background-color: green;" class="col-4"></div>
           <div style="background-color: yellow;" class="col-4"></div>
       </div>
       <div class="row ">
           <div class="col-2 align-self-center">21 | Page</div>
           <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
           <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
       </div>
     </div>
   </div>


    
   <div id="page_22" class="page text-center" >
   <div class="header">
    <div class="row ">
      <div class="col-8 align-self-center">
          Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
      </div>
      <div class="col-4 align-self-center">
          <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
      </div>
    </div>
    <div  class="row"></div>
  </div>
   <div class="content">
   <div  class="main_header_sub text-start">4.1 Direct GHG emission</div>
      
     <blockquote class=" paragraph blockquote text-start ">
       <p class="mb-0 lh-base">Direct greenhouse gas emissions from the sources own or controlled by the Bank are presented in the Table 5.</p>
     </blockquote>

     <div class="report-table-sm">
     <figcaption class="figure-caption-table figure-caption text-start">Table 5: Direct emissions for inventory year 2020</figcaption>
     <table class="table  table-bordered border-dark">
       <thead class="table-primary  border-dark">
         <tr>
           <th scope="col">Source</th>
           <th scope="col">Emissions (tCO₂e)</th>
           
         </tr>
       </thead>
       <tbody class="table-active">
         <tr>
           <td>Company own vehicles</td>
           <td>412.90</td>
          
         </tr>
         <tr>
           <td>Stand by generators</td>
           <td>239.93</td>
         </tr>
         <tr>
           <td>Refrigerant leakage</td>
           <td>235.08</td>
         </tr>
         <tr>
           <td>Employee commuting (paid)</td>
           <td>186.07</td>
         </tr>
         <tr>
           <td>LPG</td>
           <td>3.03</td>
         </tr>
         <tr>
           <td>Fire Extinguishers</td>
           <td>1.39</td>
         </tr>
         <tr >
           <th>Total</th>
           <th>1,078.40</th>
         </tr>
        
       </tbody>
     </table>
   </div>

   <blockquote class=" paragraph blockquote text-start ">
   <p class="mb-0 lh-base">
   Total direct emissions of the Bank are 1,078 tCO₂e. Company own vehicles is the largest direct emission source accounting for 38% of the total direct emissions. Contribution of each emission
    source to the total direct emissions are presented in the Figure 4.
   </p>
 </blockquote>
 <div  class="image-medium text-start"><figure class="figure ">
 <img src="http://localhost:7080/report/figures/figure4.png" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
 <figcaption class="figure-caption">Figure 4: Direct emissions by source</figcaption>
</figure></div>
   </div>

   <div  class="footer">
      <div class="row ">
          <div style="background-color: #082160;" class="col-4"></div>
          <div style="background-color: green;" class="col-4"></div>
          <div style="background-color: yellow;" class="col-4"></div>
      </div>
      <div class="row ">
          <div class="col-2 align-self-center">22 | Page</div>
          <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
          <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
      </div>
    </div>
  </div>
  
  
  <div id="page_23" class="page text-center" >
  <div class="header">
   <div class="row ">
     <div class="col-8 align-self-center">
         Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
     </div>
     <div class="col-4 align-self-center">
         <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
     </div>
   </div>
   <div  class="row"></div>
 </div>
  <div class="content">
  <div  class="main_header_sub text-start">4.2 Indirect GHG emissions</div>
      
     <blockquote class=" paragraph blockquote text-start ">
       <p class="mb-0 lh-base">
       Indirect emissions are sometimes difficult to assign to a specific operation, therefore, the reporting
        method for different sources may vary.
       </p>
     </blockquote>

     <blockquote class=" paragraph blockquote text-start ">
       <p class="mb-0 lh-base">
       The Bank’s operations use the electricity from Ceylon Electricity Board, which is the national grid.
        The National Grid consists of coal, large hydro, diesel, and non-conventional renewable energy sources. The emission factor used to calculate emissions associated with electricity consumption is 0.4694 tCO₂e/MWh. The Bank’s grid connected electricity consumption accounts for the top indirect emissions. In addition, employee commuting (not paid), T&D loss, hired vehicles, business air travel,
        municipal water and paper waste are the other sources of indirect emissions.
       </p>
     </blockquote>

     <div class="report-table-sm">
     <figcaption class="figure-caption-table figure-caption text-start">Table 6: Indirect emissions for inventory year 2020</figcaption>
     <table class="table  table-bordered border-dark">
       <thead class="table-primary  border-dark">
         <tr>
           <th scope="col">Source</th>
           <th scope="col">Indirect Emissions (tCO₂e)</th>
           
         </tr>
       </thead>
       <tbody class="table-active">
         <tr>
           <td>Grid connected electricity</td>
           <td>6023.88</td>
          
         </tr>
         <tr>
           <td>Employee commuting (not paid)</td>
           <td>1320.45</td>
         </tr>
         <tr>
           <td>T&D loss</td>
           <td>235.08</td>
         </tr>
         <tr>
           <td>Hired Vehicles</td>
           <td>186.07</td>
         </tr>
         <tr>
           <td>Business air travel</td>
           <td>3.03</td>
         </tr>
         <tr>
           <td>Municipal Water</td>
           <td>1.39</td>
         </tr>
         <tr>
         <td>Paper waste</td>
         <td>1.39</td>
       </tr>
         <tr >
           <th>Total</th>
           <th>1,078.40</th>
         </tr>
        
       </tbody>
     </table>
   </div>

            <blockquote class=" paragraph blockquote text-start ">
                <p class="mb-0 lh-base">
                Total indirect emissions of the Bank are 8,412 tCO₂e. Grid connected electricity, which accounts for 63% of the total indirect emissions, is the largest emission source. Contribution of each emission source to the total indirect emissions are presented in the Figure 5
                </p>
              </blockquote>
           
            
  </div>
            

  <div  class="footer">
     <div class="row ">
         <div style="background-color: #082160;" class="col-4"></div>
         <div style="background-color: green;" class="col-4"></div>
         <div style="background-color: yellow;" class="col-4"></div>
     </div>
     <div class="row ">
         <div class="col-2 align-self-center">23 | Page</div>
         <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
         <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
     </div>
   </div>
 </div>

    



 
 <div id="page_24" class="page text-center" >
 <div class="header">
  <div class="row ">
    <div class="col-8 align-self-center">
        Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
    </div>
    <div class="col-4 align-self-center">
        <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
    </div>
  </div>
  <div  class="row"></div>
</div>
 <div class="content">
 <div  class="image-larg "><figure class="figure ">
 <img src="http://localhost:7080/report/figures/figure5.png" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
 <figcaption class="figure-caption">Figure 5: Indirect Emissions by sources</figcaption>
</figure></div>

 
 
 </div>

 <div  class="footer">
    <div class="row ">
        <div style="background-color: #082160;" class="col-4"></div>
        <div style="background-color: green;" class="col-4"></div>
        <div style="background-color: yellow;" class="col-4"></div>
    </div>
    <div class="row ">
        <div class="col-2 align-self-center">24 | Page</div>
        <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
        <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
    </div>
  </div>
</div>
               
            
            <div id="page_25" class="page text-center" >
            <div class="header">
            <div class="row ">
              <div class="col-8 align-self-center">
                  Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
              </div>
              <div class="col-4 align-self-center">
                  <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
              </div>
            </div>
            <div  class="row"></div>
            </div>
            <div class="content">
            <div  class="main_header text-start">5 COMPARISON OF CARBON FOOTPRINT OF 2020 WITH THE BASE YEAR<sup>13</sup></div>
            <div  class="main_header_sub text-start">5.1 Comparison of organizational GHG emissions</div>

            <blockquote class=" paragraph blockquote text-start ">
                <p class="mb-0 lh-base">
                The Bank has calculated GHG emissions attributed to its operation since 2017.
                 Table 7 indicates the change of emissions attributed to each emission source over the years.
                </p>
            </blockquote>
            <div class="report-table-sm">
            <figcaption class="figure-caption-table figure-caption text-start">Table 5: Direct emissions for inventory year 2020</figcaption>
            <table class="table  table-bordered border-dark">
              <thead class="table-primary  border-dark">
                <tr>
                  <th  rowspan="2"  scope="col">Emission category</th>
                  <th  rowspan="2"  scope="col">Emission source</th>
                  <th  colspan="4"  scope="col">Activity Data</th>
                 
                  
                  
                </tr>
                <tr>
                  
                  <th scope="col">2017</th>
                  <th scope="col">2018</th>
                  <th scope="col">2019</th>
                  <th scope="col">2020</th>
                 
                  
                </tr>
              </thead>
              <tbody class="table-active">
                <tr>
                  <td rowspan="6"  scope="row">Direct emissions</td>
                  <td>Company own vehicles</td>
                  <td>417.70</td>
                  <td>411.55</td>
                  <td>355.08</td>
                  <td>412.90</td>
                </tr>
                <tr>
                  <td>Refrigerant Leakage</td>
                  <td> 346.23</td>
                  <td>411.55</td>
                  <td>290.23</td>
                  <td>235.08</td>
                </tr>
                <tr>
                  <td>Employee commuting (Paid)</td>
                  <td>276.24</td>
                  <td>271.69</td>
                  <td>285.44</td>
                  <td>186.07</td>
                </tr>
                <tr>
                  <td>Stand by Generators</td>
                  <td>264.82</td>
                  <td>273.18</td>
                  <td>349.81</td>
                  <td>239.93</td>
                </tr>
                <tr>
                  <td>Fire extinguishers</td>
                  <td>Not recorded</td>
                  <td>0.79</td>
                  <td>0.70</td>
                  <td>1.39</td>
                </tr>
                <tr>
                  <td>LPG</td>
                  <td>Not recorded</td>
                  <td>1.46</td>
                  <td>1.06</td>
                  <td>3.03</td>
                </tr>
                <tr>
                  <td></td>
                  <th>Total direct emissions</th>
                  <th>1,304.99</th>
                  <th>1,369.27</th>
                  <th>1,282.32</th>
                  <th>1,078.40</th>
                </tr>
                <tr>
                  <td rowspan="7"  scope="row">Indirect emissions</td>
                  <td>Grid Electricity</td>
                  <td>8,172.25<sup>14</sup></td>
                  <td>7654.59</td>
                  <td>7,649.18</td>
                  <td>6023.88</td>
                </tr>
                <tr>
                  <td>Employee Commuting (Not paid)</td>
                  <td>1,928.01</td>
                  <td>1885.64</td>
                  <td>1,981.01</td>
                  <td>1320.45</td>
                </tr>
                <tr>   
                  <td>T&D loss</td>
                  <td>870.85<sup>14</sup></td>
                  <td>696.48</td>
                  <td>685.98</td>
                  <td>601.59</td>
                </tr>
                <tr> 
                  <td>Hired Vehicles</td>
                  <td>466.37</td>
                  <td>434.31</td>
                  <td> 405.00 </td>
                  <td>436.93</td>
                </tr>
                <tr>   
                  <td>Business air travel</td>
                  <td>287.39</td>
                  <td>102.09</td>
                  <td>96.77</td>
                  <td>8.86</td>
                </tr>
                <tr>  
                  <td>Municipal Water</td>
                  <td>22.34</td>
                  <td>14.62</td>
                  <td>16.85</td>
                  <td> 18.26</td>
                </tr>
                <tr>  
                  <td>Paper waste</td>
                  <td>3.26</td>
                  <td>3.74</td>
                  <td>4.41 </td>
                  <td>2.13</td>
                </tr>
                <tr>
                  <td></td>
                  <th>Total direct emissions</th>
                  <th>11,750.47<sup>14</sup></th>
                  <th>10,791.47</th>
                  <th>10,839.20</th>
                  <th>8,412.10</th>
                </tr>
                <tr>
                  
                  <th colspan="2">Total emission</th>
                  <th>13,055.46<sup>14</sup></th>
                  <th>12,160.74</th>
                  <th>12,121.52</th>
                  <th>9,490.50</th>
                </tr>
              </tbody>
            </table>
          </div>



          <div class="more-info ">
          <hr>
         
            <p class="mb-0 text-start fw-light lh-sm"><small> 13 Variation of emission factors over the time have not been considered for this Comparison</small></p>
             
             
              <p class="mb-0 text-start fw-light lh-sm"><small>14 Emissions attributed to the grid electricity
               consumption and T&D loss of the branch located in the Bangladesh (644.61 tCO₂e) is reduced from
                the CFP of the 2017 to the comparison purpose as emissions
               attributed to the foreign branches will not be considered after the year 2017.</small></p>
               
         </div>
            </div>

            <div  class="footer">
              <div class="row ">
                  <div style="background-color: #082160;" class="col-4"></div>
                  <div style="background-color: green;" class="col-4"></div>
                  <div style="background-color: yellow;" class="col-4"></div>
              </div>
              <div class="row ">
                  <div class="col-2 align-self-center">25 | Page</div>
                  <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                  <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
              </div>
            </div>
            </div>



            <div id="page_26" class="page text-center" >
            <div class="header">
             <div class="row ">
               <div class="col-8 align-self-center">
                   Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
               </div>
               <div class="col-4 align-self-center">
                   <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
               </div>
             </div>
             <div  class="row"></div>
           </div>
            <div class="content">
            <div  class="main_header_sub text-start">5.2 Comparison of organizational carbon footprint over the years</div>

            <blockquote class=" paragraph blockquote text-start ">
                <p class="mb-0 lh-base">
                Total GHG emissions for the 2017, 2018,2019 and 2020 are recorded as 13,055<sup>14</sup>, 12,161, 12,122 and 9,490 
                tCO₂e respectively. As illustrated in Figure 6, total GHG emissions in 2020 is 22% lesser than that of 2019
                 and less than that of 27% base year 2017. Main cause for the total emission reduction over the years can be the reduction of grid electricity consumption due to installation of the solar PV power systems and installation of highly efficient AC units. Drastic reduction of emissions in assessment
                 year is due to the travel restrictions, remote working arrangement due to the pandemic.
                </p>
            </blockquote>
            <div  class="image-medium text-start"><figure class="figure ">
            <img src="http://localhost:7080/report/figures/figure6.png" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
            <figcaption class="figure-caption">Figure 6: Comparison of overall emissions14over the years</figcaption>
           </figure></div>
           <div  class="main_header_sub text-start">5.3 Comparison of direct GHG emissions over the years</div>

           <blockquote class=" paragraph blockquote text-start ">
               <p class="mb-0 lh-base">
               Company owned vehicles are the largest direct emission source for all three years, it is followed by standby generators,
                refrigerant leakages and employee commuting paid by the company. There is more than 15% decrease of the total direct
                 emissions in year 2020 compared to both previous year and base year mainly due to the decrease of emissions attributed to stand by
                generator, employee commuting and refrigerant leakages. This may have affected by the remote working practice of the Bank due to the pandemic.
               </p>
           </blockquote>
            
            </div>
         
            <div  class="footer">
               <div class="row ">
                   <div style="background-color: #082160;" class="col-4"></div>
                   <div style="background-color: green;" class="col-4"></div>
                   <div style="background-color: yellow;" class="col-4"></div>
               </div>
               <div class="row ">
                   <div class="col-2 align-self-center">26 | Page</div>
                   <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                   <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
               </div>
             </div>
           </div>

           <div id="page_27" class="page text-center" >
           <div class="header">
            <div class="row ">
              <div class="col-8 align-self-center">
                  Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
              </div>
              <div class="col-4 align-self-center">
                  <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
              </div>
            </div>
            <div  class="row"></div>
          </div>
           <div class="content">
           <div  class="image-medium text-start"><figure class="figure ">
           <img src="http://localhost:7080/report/figures/figure7.png" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
           <figcaption class="figure-caption">Figure 7: Comparison of direct emissions over the years</figcaption>
          </figure></div>
          <div  class="main_header_sub text-start">5.4 Comparison of indirect GHG emissions over the years</div>

          <blockquote class=" paragraph blockquote text-start ">
              <p class="mb-0 lh-base">
              Highest contributor to the indirect emissions of the Bank is grid connected electricity in all years.
               Indirect emissions also have reduced compared to both the base year and previous year by more than
                20% mostly due to the reduction of the grid electricity consumption and reduction of employee commuting.
                 Emissions attributed to the business air travel has also reduced drastically compared to both previous and base years.
                  These reductions are highly impacted by the
               travel restrictions, remote working practices within the year due to the pandemic. </p>
          </blockquote>
           
          <div  class="image-medium text-start"><figure class="figure ">
          <img src="http://localhost:7080/report/figures/figure7.png" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
          <figcaption class="figure-caption">Figure 8: Comparison of Indirect emissions over the years<sup>14</sup></figcaption>
         </figure></div>
           </div>
        
           <div  class="footer">
              <div class="row ">
                  <div style="background-color: #082160;" class="col-4"></div>
                  <div style="background-color: green;" class="col-4"></div>
                  <div style="background-color: yellow;" class="col-4"></div>
              </div>
              <div class="row ">
                  <div class="col-2 align-self-center">27 | Page</div>
                  <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                  <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
              </div>
            </div>
          </div>


          <div id="page_28" class="page text-center" >
          <div class="header">
           <div class="row ">
             <div class="col-8 align-self-center">
                 Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
             </div>
             <div class="col-4 align-self-center">
                 <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
             </div>
           </div>
           <div  class="row"></div>
         </div>
          <div class="content">
          <div  class="main_header_sub text-start">5.5 Comparisons of emission factors & other constants</div>

          <blockquote class=" paragraph blockquote text-start ">
              <p class="mb-0 lh-base">
              Since 2018 GHG inventory has been prepared in accordance with the ISO 14064, 2018 version and for
               the 2017 it was 2006 version of the standard. Table 8 indicates the change
               of emission factor of the grid electricity and the T&D loss over the years.</p>
          </blockquote>

          <div class="report-table-sm">
          <figcaption class="figure-caption-table figure-caption text-start">Table 8: Comparison of emission factor of grid electricity and T&D loss</figcaption>
          <table class="table  table-bordered border-dark">
            <thead class="table-primary  border-dark">
              <tr>
                <th scope="col">Emission factors/constants</th>
                <th scope="col">2017</th>
                <th scope="col">2018</th>
                <th scope="col">2019</th>
                <th scope="col">2020</th>
                
              </tr>
            </thead>
            <tbody class="table-active">
              <tr>
                <td>Grid electricity (kgCO₂e/kWh)</td>
                <td>0.568</td>
                <td>0.568</td>
                <td>0.568</td>
                <td>0.568</td>
               
              </tr>
              <tr>
                <td>Transmission & Distribution Loss (%)</td>
                <td>0.568</td>
                <td>0.568</td>
                <td>0.568</td>
                <td>0.568</td>
               
              </tr>
           
            </tbody>
          </table>
        </div>
       
        <div  class="main_header_sub text-start">5.6 Comparisons of per capita emission and emission intensity</div>

        <blockquote class=" paragraph blockquote text-start ">
            <p class="mb-0 lh-base">
            As per Figure 9, the per capita GHG emissions of the Bank shows a decreeing trend over the years. It has 
            decreased from 2.77 to 1.99 tCO₂e per head in year 2020 compared to the base year. </p>
        </blockquote>
         
        <div  class="image-medium text-start"><figure class="figure ">
        <img src="http://localhost:7080/report/figures/figure9.png" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
        <figcaption class="figure-caption">Figure 9: Comparison of per capita emission over the years</figcaption>
       </figure></div>
     
          </div>
       
          <div  class="footer">
             <div class="row ">
                 <div style="background-color: #082160;" class="col-4"></div>
                 <div style="background-color: green;" class="col-4"></div>
                 <div style="background-color: yellow;" class="col-4"></div>
             </div>
             <div class="row ">
                 <div class="col-2 align-self-center">28 | Page</div>
                 <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                 <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
             </div>
           </div>
         </div>

         <div id="page_29" class="page text-center" >
         <div class="header">
          <div class="row ">
            <div class="col-8 align-self-center">
                Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
            </div>
            <div class="col-4 align-self-center">
                <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
            </div>
          </div>
          <div  class="row"></div>
        </div>
         <div class="content">
         <blockquote class=" paragraph blockquote text-start ">
         <p class="mb-0 lh-base">
         As illustrated in the Figure 10, emission intensity of the Bank has also reduced over the years indicating a sustainable growth of the Bank. </p>
     </blockquote>
         <div  class="image-medium text-start"><figure class="figure ">
        <img src="http://localhost:7080/report/figures/figure10.png" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
        <figcaption class="figure-caption">Figure 10: Comparison of emission intensity over the years</figcaption>
       </figure></div>
       <div  class="main_header text-start">6 CONCLUSION</div>

       <blockquote class=" paragraph blockquote text-start ">
       <p class="mb-0 lh-base">
       Total GHG emissions of Commercial Bank PLC for inventory year 2020 is 9,490 tCO₂e, which was calculated in accordance with the requirements of ISO 14064-1:2018.</p>
   </blockquote>
   
   <blockquote class=" paragraph blockquote text-start ">
   <p class="mb-0 lh-base">
   ClimateSI believes that this assessment will support to enhance the brand image of the Bank. In addition, the outcomes of this assessment will also support to
    identify more opportunities for GHG reduction.</p>
</blockquote>

         
         </div>
      
         <div  class="footer">
            <div class="row ">
                <div style="background-color: #082160;" class="col-4"></div>
                <div style="background-color: green;" class="col-4"></div>
                <div style="background-color: yellow;" class="col-4"></div>
            </div>
            <div class="row ">
                <div class="col-2 align-self-center">29 | Page</div>
                <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
            </div>
          </div>
        </div>


        <div id="page_30" class="page text-center" >
        <div class="header">
         <div class="row ">
           <div class="col-8 align-self-center">
               Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
           </div>
           <div class="col-4 align-self-center">
               <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
           </div>
         </div>
         <div  class="row"></div>
       </div>
        <div class="content">
        <div  class="main_header text-start">7 RECOMMENDATIONS</div>

<div  class="main_header_sub text-start">7.1 Information management system</div>
<div class="main_header_sub_sub-bold">
Establish and maintain information management procedure
</div>
<blockquote class=" paragraph blockquote text-start ">
    <p class="mb-0 lh-base">
    It is recommended to establish a systematic procedure within the Bank to ensure completeness,
     accuracy, transparency, and consistency of the GHG inventory preparation process. This procedure
      may include task need to be carry out, responsible personal for each task, their specific roles 
      and responsibilities in defining boundaries, identifying emission sources, activity data collection,
       data processing, selecting a GHG inventory developer and method of developing to meet the requirement
        of intended users of the inventory and archiving activity data and GHG inventory related documents.
         In order to ensure the practical implementation of the procedure, scope of the existing practices
          within the Bank may extend to cover the GHG assessment. For an example, in order to identify errors,
           omissions and to ensure accuracy and completeness of the GHG inventory, scope of the 
    internal audits may include activity data inserted into the SCC for GHG inventory preparation.</p>
</blockquote>

<div class="main_header_sub_sub-bold">
Establish robust data management system
</div>
<blockquote class=" paragraph blockquote text-start ">
    <p class="mb-0 lh-base">
    SCC has designed to capture the data attributed to each emission source of 
    the Bank. Further, it facilitates to provide access to all the intended users. However,
     quality of the activity data must be assured by the Bank.
     This will be the responsibility of the institutional admin of the SCC.</p>
</blockquote>
<blockquote class=" paragraph blockquote text-start ">
<p class="mb-0 lh-base">
Responsibility of the data collection and archiving process can be delegated by
 creating Data Entry Operators and Branch officers. Further it is also recommended to
  identify Data Entry Operators for each emission source, they will be responsible for ensuring the
   accuracy, quality and consistency of the activity
 data entered to the system by them self or branch operators.</p>
</blockquote> 
<blockquote class=" paragraph blockquote text-start ">
<p class="mb-0 lh-base">
Even though data are available in the SCC, it is recommended to maintain and archive original GHG
 inventory related documents such as bills, logbooks, invoices, etc. including information management
  activities for the verification purposes. These processes will reduce the uncertainties associated with
   the calculation especially with company own vehicles, stand by generators,
 LPG, hired vehicles, employee commuting and municipal water.</p>
</blockquote> 
        
        
        </div>
     
        <div  class="footer">
           <div class="row ">
               <div style="background-color: #082160;" class="col-4"></div>
               <div style="background-color: green;" class="col-4"></div>
               <div style="background-color: yellow;" class="col-4"></div>
           </div>
           <div class="row ">
               <div class="col-2 align-self-center">30 | Page</div>
               <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
               <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
           </div>
         </div>
       </div>
       <div id="page_31" class="page text-center" >
       <div class="header">
        <div class="row ">
          
          <div class="col-8 align-self-center">
              Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
          </div>
          <div class="col-4 align-self-center">
              <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
          </div>
        </div>
        <div  class="row">

        </div>


       </div>
       <div class="content">
       <div  class="main_header text-start">8 ONGOING GHG MITIGATION AND REMOVAL ENHANCEMENT PROJECTS OF THE BANK</div>

       <blockquote class=" paragraph blockquote text-start ">
         <p class="mb-0 lh-base">Number of actions have been taken to increase the natural capital of the Bank. Following indicates few of them</p>
       </blockquote>
       <div class="main_header_sub_sub-bold"> Continuation of solar panel installation in feasible branches island wide.</div>
       <blockquote class=" paragraph blockquote text-start ">
       <p class="mb-0 lh-base">At the beginning of the year 2020, the Bank only had 49 solar powered branches. However, at the end of the 2020 it was increased
        up to 60 branches achieving 22% of growth within the year.</p>
       </blockquote>
          <div class="main_header_sub_sub-bold">
          Promote reduction and recycling of wastepaper
          </div>
          <blockquote class=" paragraph blockquote text-start ">
          <p class="mb-0 lh-base">The Bank promote 3R principle and promote reduction, reuse and recycling of paper waste through various measures.</p>
          </blockquote>

      <div class="main_header_sub_sub-bold">  Promote online and mobile Banking</div>
      <blockquote class=" paragraph blockquote text-start ">
      <p class="mb-0 lh-base">The Bank has increased its online Banking users by 49% within the year.
       This also cause reducing direct and indirect emissions of the Bank.</p>
      </blockquote>
      <div class="main_header_sub_sub-bold">Switched to energy efficient appliances</div>
      <blockquote class=" paragraph blockquote text-start ">
      <p class="mb-0 lh-base">Introduction of efficient AC systems, switching to more environmentally friendly refilling gases, introduction of efficient lighting system over the branch network have
       also helped the Bank to reduce its GHG emissions within the year.</p>
      </blockquote>
    
      <div  class="main_header text-start">9 NEXT STEPS</div>
      <div class="list-main">
        <ul>
          <li><blockquote class="blockquote  ">
            <p class="mb-0 lh-base">Establish a systematic approach to feed data monthly to SCC</p>
          </blockquote></li>
          <li><blockquote class="blockquote  ">
            <p class="mb-0 lh-base">Reach carbon neutral in 2025 through following Carbon Neutral Action Plan</p>
          </blockquote></li>
          
        </ul> 
      </div>
       
       </div>
    
       <div  class="footer">
          <div class="row ">
              <div style="background-color: #082160;" class="col-4"></div>
              <div style="background-color: green;" class="col-4"></div>
              <div style="background-color: yellow;" class="col-4"></div>
          </div>
          <div class="row ">
              <div class="col-2 align-self-center">31 | Page</div>
              <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
              <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
          </div>
       </div>
      </div>

                   
                         <div id="page_32" class="page text-center" >
                         <div class="header">
                          <div class="row ">
                            
                            <div class="col-8 align-self-center">
                                Greenhouse Gas Inventory Report – Commercial Bank of Ceylon
                            </div>
                            <div class="col-4 align-self-center">
                                <img height="50px" src="http://localhost:7080/report/cover/logo.png" >
                            </div>
                          </div>
                          <div  class="row">
                
                          </div>
                
                
                         </div>
                         <div class="content">
                         <div  class="main_header text-start">ANNEX 1</div>
                         <div class="main_header_sub_sub-bold">Branches which have outsourced or use common stand by generators</div>
                         <div class="report-table-sm">
                         <table class="table  table-bordered border-dark">
                           
                           <tbody class="table-active">
                             <tr>
                               <td>Pettah</td>
                               <td>Gampaha(minicom)</td>
                             </tr>
                             <tr>
                               <td>Kandy city office</td>
                               <td>Matara(keels super)branch</td>
                             </tr>
                             <tr>
                             <td>Kandy city office</td>
                             <td>Matara(keels super)branch</td>
                             </tr>
                             <tr>
                             <td>Peliyagoda</td>
                             <td>Panadura(keel super)branch</td>
                             </tr>
                             <tr>
                             <td>Ekala</td>
                             <td>Horana(wijemanna super)branch</td>
                             </tr>
                             <tr>
                             <td>Kuruwita</td>
                             <td>Rajagiriya(keels super)br</td>
                             </tr>
                             <tr>
                             <td>Katunayake BIA depature</td>
                             <td>Kadawatha(arpico super)br</td>
                             </tr>
                             <tr>
                             <td>Bangaladesh</td>
                             <td>Wattala (arpico super center)</td>
                             </tr>
                             <tr>
                             <td>Katunayake BIA arrival</td>
                             <td>Nawinna(arpico super) branch - no bill</td>
                             </tr>
                             <tr>
                             <td>World trade center</td>
                             <td>Katugastota (minicom)</td>
                             </tr>

                          
                           </tbody>
                         </table>
                       </div>


                       <div class="main_header_sub_sub-bold">Branches which have not used /not available stand by generators</div>
                       <div class="report-table-sm">
                       <table class="table  table-bordered border-dark">
                         
                         <tbody class="table-active">
                           <tr>
                             <td>Wellawatte</td>
                             <td>Union place</td>
                           </tr>
                           <tr>
                           <td>Godakawela branch</td>
                           <td>Grandpas</td>
                         </tr>
                           <tr>
                             <td>Palavi branch</td>
                             <td>S.L.I.C. CSP</td>
                           </tr>
                        
                         </tbody>
                       </table>
                     </div>
                         
                         </div>
                      
                         <div  class="footer">
                            <div class="row ">
                                <div style="background-color: #082160;" class="col-4"></div>
                                <div style="background-color: green;" class="col-4"></div>
                                <div style="background-color: yellow;" class="col-4"></div>
                            </div>
                            <div class="row ">
                                <div class="col-2 align-self-center">32 | Page</div>
                                <div class="col-9  align-self-start">Climate Smart Initiatives (Pvt.) Ltd</div>
                                <div class="col-1 align-self-center">  <img height="50px" src="http://localhost:7080/report/cover/climatesi_logo.png" ></div>
                            </div>
                            
                
                         </div>
                          </div>

              </body></html>`
  }
  // http://localhost:7080/report/cover/
  return await html_to_pdf.generatePdf(file, options)

}

}
