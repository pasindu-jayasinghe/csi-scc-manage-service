import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Unit } from "./unit.entity";


@Entity()
export class UnitDetails extends BaseTrackingEntity{
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({nullable: true})
    address: string;
    @Column({nullable: true})
    addressLine2: string;
    @Column({nullable: true})
    addressLine3: string;

    @Column({nullable: true})
    email: string;

    @Column({nullable: true})
    code: string;

    @Column({nullable: true})
    telephone: string;

    @Column({nullable: true}) 
    employees: number;

    @Column({nullable: true})
    logopath: string;

    @Column({ length: "250", nullable: true })
    introduction: string;

    @Column({nullable: true})
    baseYear: number;

    @Column({nullable: true})
    baseYearEmission: number;

    @Column({nullable: true}) 
    faxNumber: string;

    @Column({nullable: true}) 
    registrationNumber: string;
      
    @OneToOne(() => Unit)
    @JoinColumn()
    unit: Unit
  unitDetaildto: Unit[];
}
