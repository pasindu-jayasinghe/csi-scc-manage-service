import { Controller, UseGuards } from '@nestjs/common';
import {  Crud, CrudController} from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CountryService } from './country.service';
import { Country } from './entities/country.entity';


@Crud({
  model: {
    type: Country,
  },
  query: {
    join: {
      // unit: {
      //   eager: true,
      // },
    },
  },
})

@UseGuards(JwtAuthGuard)
@Controller('country')
export class CountryController implements CrudController<Country>{
  constructor(public service: CountryService){}

    // get base(): CrudController<Country> {
    //   return this;
    // }
  
  
   

  // @Post()
  // create(@Body() createCountryDto: Country): Promise<Country>{
  //   return this.service.create(createCountryDto);
  // }

  // @Get()
  // findAll() {
  //   return this.countryService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string): Promise<Country> {
  //   return this.service.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto) {
  //   return this.service.update(+id, updateCountryDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.service.remove(+id);
  // }


 
  
 
}
