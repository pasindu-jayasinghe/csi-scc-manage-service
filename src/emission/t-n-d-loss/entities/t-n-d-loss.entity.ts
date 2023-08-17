import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TNDLossActivityData extends EmissionBaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    meterNo: string;

    @Column()
    month: number;

    @Column()
    year: number;

    @Column({type: "double",default: 0})
    consumption: number;

    @Column()
    consumption_unit: string;

    @Column({type: "double",default: 0})
    emission: number;
}
