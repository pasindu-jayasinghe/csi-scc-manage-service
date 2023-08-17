import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Unit } from "src/unit/entities/unit.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";



@Entity()
export class EmployeeName extends BaseTrackingEntity {

    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;

    @Column()
    empId: string;

    @Column()
    code: string;

    @ManyToOne((type) => Unit, { eager: false })
    @JoinColumn()
    unit: Unit;


}
