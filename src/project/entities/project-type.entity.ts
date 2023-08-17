import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ProjectType  extends BaseTrackingEntity{


    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
    
    @Column()
    code: string;
}
