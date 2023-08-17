
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EmissionSource } from "./emission-source.entity";

@Entity()
export class EmissionCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, default: ''})
    code: string;


    @Column({nullable: false, default: ""})
    name: string;


}
