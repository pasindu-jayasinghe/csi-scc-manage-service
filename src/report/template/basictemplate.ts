export const template=`<!DOCTYPE html>
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


    <div id="page_1" class=" page  text-center" >
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





     <div id="page_2" class="page text-center" >
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
              Nations Intergovernmental Panel on Climate Change’s (IPCC) Fifth Assessment Report (AR5). All GHG emissions were reported as tonnes of CO2 equivalent (tCO2e).  </p>
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
        
        <blockquote class=" paragraph blockquote text-start ">
        <p class="mb-0 lh-lg">As Figure 1 illustrates, the total carbon footprint of the Bank, for the 2020 is 9,490 tCO2e.</p>
      </blockquote>
      <blockquote class=" paragraph blockquote text-start ">
        <p class="mb-0 lh-lg">   Per capita emissions and emission intensity for the assessment year are 1.99 tCO2e 
          per person and 0.06 tCO2e per million rupees respectively (considering direct and indirect emissions).</p>
      </blockquote>
      <div style="margin-top: 50px;" class="image-larg "><figure class="figure ">
        <img src="http://localhost:7080/report/figures/figure2.png" class="figure-img img-thumbnail" alt="A generic square placeholder image with rounded corners in a figure.">
        <figcaption class="figure-caption">Figure 2: GHG emissions by source for the inventory year 2020</figcaption>
      </figure></div>
      <blockquote class=" paragraph blockquote text-start ">
        <p class="mb-0 lh-lg"> As per Figure 2, GHG emissions due to grid connected electricity 
          (6,024 tCO2e, 63% of the total GHG emissions), is the largest GHG emission source, which 
          is followed by employee commuting not paid by the company
           (1,320 tCO2e, 14%), and transmission and distribution loss of electricity (602 tCO2e, 6%).</p>
      </blockquote>
        
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
         
         <div class="table-of-content ">
            <div  class="table-of-content-main-headers text-start">Table of Contents</div>
            <div class="table-of-content-header-item"><div >SUMMARY.......................................................................................................................................................................................</div><div ><bdi>.............1</bdi></div> </div>
            <div class="table-of-content-header-item" ><div >List of Tables ....................................................................................................................................................................</div><div ><bdi>.............1</bdi></div> </div>
            <div class="table-of-content-header-item"><div >List of Tables ................................................................................................................................................................</div><div ><bdi>.................1</bdi></div> </div>
            <div class="table-of-content-header-item"><div >1 INTRODUCTION ....................................................................................................................................................................</div><div ><bdi>.............1</bdi></div> </div>
            
              
                <div class="table-of-content-sub-header-item"><div >1.1 Introduction to the organization ................................................................................................................................</div><div ><bdi>.................4</bdi></div> </div>
                <div class="table-of-content-sub-header-item"><div >1.2 Persons responsible ..................................................................................................................................................</div><div ><bdi>.............4</bdi></div> </div>
                <div class="table-of-content-sub-header-item"><div >1.3 Purpose of the report ..................................................................................................................................................</div><div ><bdi>.............14</bdi></div> </div>
                 <div class="sub-sub table-of-content-sub-header-item"> <div >2.2.1 Direct GHG emissions ........................................................................................................................................................................</div><div ><bdi>.....111</bdi></div></div>
                <div class="table-of-content-sub-header-item"><div >1.4 Intended users ......................................................................................................................................................</div><div ><bdi>.....10</bdi></div> </div>
                <div class="table-of-content-sub-header-item"><div >1 INTRODUCTION .........................................................................................................................................................</div><div ><bdi>.....10</bdi></div> </div>
             
              <div class="table-of-content-header-item"><div >2 BOUNDARIES.................................................................................................................................................................</div><div ><bdi>.....100</bdi></div> </div>

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
          <div class="list-of-content ">
          <div  class="list-of-content-main-headers text-start">List of Tables</div> 
          <div class="list-of-content-header-item"><div >Table 1: Activity data used for quantifying GHGs. ......................................................................................................................................................................</div><div ><bdi>.....12</bdi></div> </div>
          <div class="list-of-content-header-item" ><div >Table 2: Emission factors and other constants used for quantifying GHGs ...................................................................................</div><div ><bdi>.....16</bdi></div> </div>
          <div class="list-of-content-header-item"><div >Table 3: List of excluded emission sources.........................................................................................................................................................................</div><div ><bdi>.....87</bdi></div> </div>
          <div class="list-of-content-header-item"><div >Table 4: List of excluded emission sources...................................................................................................................................................................................</div><div ><bdi>.....100</bdi></div> </div>
          <div class="list-of-content-header-item"><div >Table 5: Direct emissions for inventory year 2020...........................................................................................................................................................</div><div ><bdi>.....100</bdi></div> </div>
          <div class="list-of-content-header-item"><div >Table 6: Indirect emissions for inventory year 2020 .................................................................................................................................................................................................</div><div ><bdi>.....100</bdi></div> </div>
          <div class="list-of-content-header-item"><div >Table 7: Comparison of GHG inventories over the years ........................................................................................................................................................</div><div ><bdi>.....100</bdi></div> </div>
          <div class="list-of-content-header-item"><div >Table 8: Comparison of emission factor of grid electricity and T&D loss .........................................................................................</div><div ><bdi>.....100</bdi></div> </div>

          </div>
          <div class="spacer"></div>

              
          <div class="list-of-content ">
            <div  class="list-of-content-main-headers text-start">List of Figures</div> 
            <div class="list-of-content-header-item"><div >Figure 1: GHG emissions for inventory year 2020 .......................................................................................................................................................................</div><div ><bdi>.....12</bdi></div> </div>
            <div class="list-of-content-header-item" ><div >Figure 2: GHG emissions by source..............................................................................................................................................................</div><div ><bdi>.....16</bdi></div> </div>
            <div class="list-of-content-header-item"><div >Figure 3: Direct and Indirect GHG emission sources selected for the inventory ........................................................................................................................................................................</div><div ><bdi>.....87</bdi></div> </div>
            <div class="list-of-content-header-item"><div >Figure 4: Direct emissions by source..................................................................................................................................................................................</div><div ><bdi>.....100</bdi></div> </div>
            <div class="list-of-content-header-item"><div >Figure 5: Indirect Emissions by sources .................................................................................................................................................................................</div><div ><bdi>.....100</bdi></div> </div>
            <div class="list-of-content-header-item"><div >Figure 6: Comparison of overall emissionsover the years..................................................................................................................................................................................................</div><div ><bdi>.....100</bdi></div> </div>
            <div class="list-of-content-header-item"><div >Figure 7: Comparison of direct emissions over the years ............................................................................................................................................................</div><div ><bdi>.....100</bdi></div> </div>
            <div class="list-of-content-header-item"><div >Figure 8: Comparison of Indirect emissions over the years ............................................................................................</div><div ><bdi>.....100</bdi></div> </div>
            <div class="list-of-content-header-item"><div >Figure 9: Comparison of per capita emission over the years ...............................................................................................................................................................</div><div ><bdi>.....100</bdi></div> </div>
            <div class="list-of-content-header-item"><div >Figure 10: Comparison of emission intensity over the years ............................................................................................................................................................</div><div ><bdi>.....100</bdi></div> </div>
            
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
           
           <div  class="main_header text-start">2 BOUNDARIES The first step in calculation of carbon footprint is to set the boundary.</div>
           <blockquote class=" paragraph blockquote text-start ">

             <p class="mb-0 lh-base">The first step in calculation of carbon footprint is to set the boundary.
                This is important as it determines which sources and sinks of the organization
                must be included in the footprint calculation and which are to be excluded.</p>
           </blockquote>

           <div  class="main_header_sub text-start">2.1 Setting up the organizational boundaries</div>

           <blockquote class=" paragraph blockquote text-start ">
             <p class="mb-0 lh-base">ISO 14064-1:2018 standard allows the setting of organizational boundaries on
                either the control approach or the equity shareholding approach. According to the control approach,
                 all emissions and removals from the facilities over which it has financial or operational control
                  should be accounted. According to the shareholding approach, emissions of the entities
                in which the organization has a share must be counted in proportionate to the shareholding.</p>
           </blockquote>

           <div  class="main_header_sub_sub text-start">2.2.1 Direct GHG emissions</div>

           <blockquote class=" paragraph blockquote text-start ">
             <p class="mb-0 lh-base">Under the control approach, each entity accounts for 100 percent of the GHG emissions 
               from operations over which it has control. It does not account for GHG emissions from operations where it has
                an interest but has no control. Control can be defined either financial or operational terms. When using the 
                control approach to consolidate GHG emissions, companies shall choose between either the operational control 
                or financial control criteria. Financial control was selected as the control approach for this study. As such, 
                organizational boundary chosen for calculating the carbon footprint for the inventory year 2020 was head office, 
                268 branches island wide, holiday homes, quarters1. Even though Bank has three overseas branches
                in Bangladesh, Maldives, and Myanmar those were not considered for the assessment.</p>

           </blockquote>
           
           
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
               <div  class="row">
     
               </div>
     
     
              </div>
              <div class="content">
              <div class="main_header_sub_sub-bold">

              A caption for the above image
            </div>


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
                     <div class="col-2 align-self-center">2 | Page</div>
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
                <div  class="row">
      
                </div>
      
      
               </div>
               <div class="content">
               <div  class="main_header text-start">8 ONGOING GHG MITIGATION AND REMOVAL ENHANCEMENT PROJECTS OF THE BANK</div>

               <blockquote class=" paragraph blockquote text-start ">
                 <p class="mb-0 lh-base">Number of actions have been taken to increase the natural capital of the Bank. Following indicates few of them</p>
               </blockquote>
               <div class="main_header_sub_sub-bold"> A caption for the above image</div>
               <blockquote class=" paragraph blockquote text-start ">
               <p class="mb-0 lh-base">The first step in calculation of carbon footprint is to set the boundary.
                 This is important as it determines which sources and sinks of the organization
                 must be included in the footprint calculation and which are to be excluded.</p>
               </blockquote>
                  <div class="main_header_sub_sub-bold">
                    A caption for the above image
                  </div>
                  <blockquote class=" paragraph blockquote text-start ">
                  <p class="mb-0 lh-base">The first step in calculation of carbon footprint is to set the boundary.
                    This is important as it determines which sources and sinks of the organization
                    must be included in the footprint calculation and which are to be excluded.</p>
                  </blockquote>

              <div class="main_header_sub_sub-bold">  A caption for the above image</div>
              <blockquote class=" paragraph blockquote text-start ">
              <p class="mb-0 lh-base">The first step in calculation of carbon footprint is to set the boundary.
              This is important as it determines which sources and sinks of the organization
              must be included in the footprint calculation and which are to be excluded.</p>
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
                      <div class="col-2 align-self-center">2 | Page</div>
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
                 <div  class="row">
                 </div>
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
                      <td colspan="2" >Fire Extinguishers (CO2)</td>
                      <td>1.40</td>
                      <td>t/year</td>
                      <td>Security logbook</td>
                    </tr>



                    <tr>
                      <td rowspan="2" >Company owned vehicles</td>
                      <td>Petrol2</td>
                      <td>121</td>
                      <td rowspan="2">m3/year</td>
                      <td rowspan="2">Central Accounts of the Ban</td>
                      
                    </tr>
                    <tr>
                      <td>Diesel2</td>
                      <td>8.58</td>
                    </tr>
                   



                    <tr>
                      <td colspan="2" >Business air travels</td>
                      <td>Departure, Destination Country, One way/ Round Trip,</td>
                      <td>-</td>
                      <td>Logistic Department</td>
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
                       <div class="col-2 align-self-center">2 | Page</div>
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
                  <div  class="row">
        
                  </div>
        
        
                 </div>
                 <div class="content">
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
              
                 <p class="mb-0 text-start fw-light lh-sm"><small> first step in calculation of carbon footprint is to set the boundary.
                  This is important as it determines which sources and sinks of the organization
                  must be included in the footprint calculation and which are to be excluded.</small></p>
                  
                  
                   <p class="mb-0 text-start fw-light lh-sm"><small>which sources and sinks of the organization
                     must be included in the footprint calculation and which are to be excluded.</small></p>
                    
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

        </body></html>`