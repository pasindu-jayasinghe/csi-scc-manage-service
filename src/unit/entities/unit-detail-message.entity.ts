import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Unit } from "./unit.entity";

export enum MessageAction {
    SUBMITED = 1
}

@Entity()
export class UnitDetailMessage extends BaseTrackingEntity{
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({nullable: true}) 
    message: string;

    @Column({nullable: true}) 
    messageAction: MessageAction;

    @Column({nullable: true}) 
    date: Date;
      
    @ManyToOne(() => Unit, {eager: false, cascade: false})
    @JoinColumn()
    unit: Unit
}
