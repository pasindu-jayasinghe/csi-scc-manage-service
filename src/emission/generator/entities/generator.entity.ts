import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class GeneratorActivityData extends EmissionBaseEntity{
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    month: number;

    @Column()
    year: number;

    @Column({ type: "double",default: 0 })
    fc: number;

    @Column()
    fc_unit: string;

    @Column()
    fuelType: string;
    
    @Column({nullable: true, default: ''})
    generatorNumber: string;

    @Column()
    emission: number;

    @Column({nullable: true})
    nzType: string;

    
}
