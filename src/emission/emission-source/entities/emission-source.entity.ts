import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProjectEmissionSource } from "./project-emission-source.entity";

@Entity()
export class EmissionSource  extends BaseTrackingEntity{

    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;

    @Column({default: null})
    sbtName: string;

    @Column()
    code: string;

    @OneToMany((type) => ProjectEmissionSource, (projectEmissionSource) => projectEmissionSource.emissionSource)
    projectEmissionSource: ProjectEmissionSource[]

    //TODO
    // Create separate service in front end to call activity data apis
    // Save the url in emission source table and pass to the service

  
  
  
    
  
  
   
  



}
