import { Country } from "src/country/entities/country.entity";
import { ProjectUnit } from "src/project/entities/project-unit.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UnitStatus } from "../enum/unit-status.enum";
import { UnitController } from "../unit.controller";
import { Industry } from "./industry.entity";
import { Level } from "./level.entity";
import { UnitDetails } from "./unit-details.entity";


@Entity()
export class Unit extends BaseTrackingEntity{
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;

    @Column({nullable: true})
    levelName: string;

    // @ManyToOne((type) => Level, { eager: true })
    // @JoinColumn()
    // level: Level;

    @ManyToOne((type) => Country, { eager: true })
    @JoinColumn()
    country: Country;

    @Column()
    levelDetailsId: number;


    @OneToMany((type) => Unit, (childUnit) => childUnit.parentUnit)
    childUnits: Unit[]

    @ManyToOne((type) => Unit, { eager: false}) // dont change eager = false
    @JoinColumn()
    parentUnit: Unit; 

    @OneToMany((type) => ProjectUnit, (projectUnit) => projectUnit.project,  { cascade: ['insert', 'update'] })
    projectUnits: ProjectUnit[]

    @ManyToOne((type) => Industry, { eager: true })
    @JoinColumn()
    industry: Industry;

    @Column({default: UnitStatus.INITIAL})
    unitStatus: UnitStatus;

    @CreateDateColumn({ name: 'created_year'})
    createdAt: Date;
    
    @Column({nullable: true})
    perfix: string

}
