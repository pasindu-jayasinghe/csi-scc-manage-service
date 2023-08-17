import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EmissionSource } from 'src/emission/emission-source/entities/emission-source.entity';
import { EmissionSourceService } from 'src/emission/emission-source/service/emission-source.service';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { Repository } from 'typeorm';
import { CreateParameterDto } from '../dto/create-parameter.dto';
import { ManyParameterResDto } from '../dto/many-parameter-res.dto';
import { ManyParameterDto } from '../dto/many-parameter.dto';
import { UpdateParameterDto } from '../dto/update-parameter.dto';
import { Parameter } from '../entities/parameter.entity';

@Injectable()
export class ParameterService extends TypeOrmCrudService<Parameter>{
  

  constructor(
    @InjectRepository(Parameter) repo,
    @InjectRepository(Parameter)
    private readonly parameterRepository: Repository<Parameter>,
    private esService: EmissionSourceService
  ) {
    super(repo);
  }

  async getManyParamtersByESList(req: ManyParameterDto) : Promise<ManyParameterResDto>{
    throw new Error('Method not implemented.'); // TODO: impl
  }

  findAll() {
    return this.parameterRepository.find();
  }

  async update(id: number, updateParameterDto: Parameter) {

    const updated = await this.repo.update({
      id: id
    }, updateParameterDto);
    if (updated.affected === 1) {
      return await this.repo.findOne(id);
    } else {
      throw new InternalServerErrorException("Updating is failed");
    }

  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
  /**
   * Parameter code needs to be same as the column name in activity data
   */
  async seed() {
    let esParameters = [
      {
        es: sourceName.Boilers,
        parameters: [
          {name: "Consumption", code: "consumption"}
        ]
      },
      {
        es: sourceName.Electricity,
        parameters: [
          {name: "Consumption", code: "consumption"}
        ]
      },
      {
        es: sourceName.t_n_d_loss,
        parameters: [
          {name: "Consumption", code: "consumption"}
        ]
      },
      {
        es: sourceName.FireExtinguisher,
        parameters: [
          {name: "No of tanks", code: "noOfTanks", isConstant: true},
          {name: "Weight per tank", code: "weightPerTank", isConstant: true}
        ]
      },
      {
        es: sourceName.Forklifts,
        parameters: [
          {name: "Consumption", code: "consumption"}
        ]
      },
      {
        es: sourceName.Generator,
        parameters: [
          {name: "Fuel consumption", code: "fc"}
        ]
      },
      {
        es: sourceName.Municipal_water,
        parameters: [
          {name: "Consumption", code: "consumption"}
        ]
      },
      {
        es: sourceName.Refrigerant,
        parameters: [
          {name: "Weight of replaced amount of the refrigerant gas", code: "w_RG"}
        ]
      },
      {
        es: sourceName.Waste_water_treatment,
        parameters: [
          {name: "Total industry product", code: "tip"},
          {name: "Chemical oxigen demand ", code: "cod"},
          {name: "Sludge removed", code: "sludgeRemoved"},
          {name: "Recovered CH4", code: "recoveredCh4"}, //Recovered CH₄
          {name: "Waste generated", code: "wasteGenerated"}
        ]
      },
      {
        es: sourceName.WeldingEs,
        parameters: [
          {name: "Acetylene consumption", code: "ac"},
          {name: "Liquid CO2 Consumption ", code: "lc"} //Liquid CO₂ Consumption
        ]
      },
      {
        es: sourceName.waste_disposal,
        parameters: [
          {name: "Amount Disposed", code: "amountDisposed"}
        ]
      },
      {
        es: sourceName.cooking_gas,
        parameters: [
          {name: "Consumption", code: "fcn"}
        ]
      },
      {
        es: sourceName.freight_air,
        parameters: [
          {name: "Number of trips", code: "noOfTrips"},
          {name: "Up distance travelled", code: "upDistance"},
          {name: "Down distance travelled", code: "downDistance"},
          {name: "Up weight", code: "upWeight"},
          {name: "Down cost per km", code: "downCostPerKM", isConstant: true}
        ]
      },
      {
        es: sourceName.freight_offroad,
        parameters: [
          {name: "Number of Trips", code: "noOfTrips"},
          {name: "Total Distance Travelled", code: "totalDistanceTravelled"},
          {name: "Weight", code: "weight"},
          {name: "Fuel Consumption", code: "fuelConsumption"}
        ]
      },
      {
        es: sourceName.freight_rail,
        parameters: [
          {name: "Number of Trips", code: "noOfTrips"},
          {name: "Weight", code: "weight"},
          {name: "Fuel Consumption", code: "fuelConsumption"}
        ]
      },
      {
        es: sourceName.freight_road,
        parameters: [
          {name: "Number of Trips", code: "noOfTrips"},
          {name: "Up distance travelled", code: "upDistance"},
          {name: "Down distance travelled", code: "downDistance"},
          {name: "Up weight", code: "upWeight"},
          {name: "Down weight", code: "downWeight"},
          {name: "Up cost per km", code: "upCostPerKM", isConstant: true},
          {name: "Down cost per km", code: "downCostPerKM", isConstant: true},
          {name: "Fuel Consumption", code: "fuelConsumption"}
        ]
      },
      {
        es: sourceName.freight_water,
        parameters: [
          {name: "Number of Trips", code: "noOfTrips"},
          {name: "Up distance travelled", code: "upDistance"},
          {name: "Down distance travelled", code: "downDistance"},
          {name: "Up weight", code: "upWeight"},
          {name: "Down weight", code: "downWeight"},
          {name: "Fuel Consumption", code: "fuelConsumption"}
        ]
      },
      {
        es: sourceName.passenger_air,
        parameters: [
          {name: "Number of Trips", code: "noOfTrips"},
          {name: "Number of employees", code: "noOfEmployees"}
        ]
      },
      {
        es: sourceName.passenger_offroad,
        parameters: [
          {name: "Number of Trips", code: "noOfTrips"},
          {name: "Total distance travelled", code: "totalDistanceTravelled"},
          {name: "Fuel Consumption", code: "fuelConsumption"},
          {name: "Fuel economy", code: "fuelEconomy", isConstant: true}
        ]
      },
      {
        es: sourceName.passenger_rail,
        parameters: [
          {name: "Number of Trips", code: "noOfTrips"},
          {name: "Total distance travelled", code: "totalDistanceTravelled"},
          {name: "Fuel consumption", code: "fuelConsumption"},
          {name: "Fuel economy", code: "fuelEconomy", isConstant: true}
        ]
      },
      {
        es: sourceName.passenger_road,
        parameters: [
          {name: "Number of Trips", code: "noOfTrips"},
          {name: "Number of working days", code: "workingDays"},
          {name: "Total distance travelled", code: "totalDistanceTravelled"},
          {name: "Fuel consumption - Business trvel ", code: "btFuelConsumption"},
          {name: "Petrol consumption", code: "petrolConsumption"},
          {name: "Diesel consumption", code: "dieselConsumption"},
          {name: "Distance travelled by no emission mode", code:"noEmissionDistance"},
          {name: "Distance travelled by public mode", code: "publicDistance"},
          {name: "Distance travelled by private mode", code: "privateDistance"},
          {name: "Fuel economy", code: "fuelEconomy", isConstant: true},
          {name: "Cost per km", code: "cost", isConstant: true}
        ]
      },
      {
        es: sourceName.offroad_machinery,
        parameters: [
          {name: "Number of Trips", code: "noOfTrips"},
          {name: "Total distance travelled", code: "totalDistanceTravelled"},
          {name: "Fuel consumption", code: "fuelConsumption"},
          {name: "Fuel economy", code: "fuelEconomy", isConstant: true}
        ]
      },
      {
        es: sourceName.passenger_water,
        parameters: [
          {name: "Fuel consumption", code: "fuelConsumption"},
          {name: "Number of Trips", code: "noOfTrips"},
        ]
      }
    ];

    Promise.all(esParameters.map(async para => {
      const es = await this.esService.findOne({ code: para.es })
      // console.log(es.code , para.es)
      if (es !== undefined){
        await Promise.all(
          para.parameters.map(async p => {
            const parameter = await this.repo.find({ code: p.code, source: es })
            if (parameter.length === 0) {
              const _para = new Parameter()
              _para.name = p.name;
              _para.code = p.code;
              _para.source = es;
              _para.isConstant = p.isConstant
              await this.parameterRepository.save(_para)
            }
          })
        )
      }
    }))
  }
}
