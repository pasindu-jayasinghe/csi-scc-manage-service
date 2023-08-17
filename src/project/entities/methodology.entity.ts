import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProjectType } from "./project-type.entity";

@Entity()
export class Methodology  extends BaseTrackingEntity{


    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;

    @Column()
    code: string;

    @Column({length: 500,nullable: true })
    description: string;

    @ManyToOne((type) => ProjectType, { eager: true })
    @JoinColumn()
    projectType: ProjectType;
    

    
}
