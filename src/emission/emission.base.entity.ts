import { Column, JoinColumn, ManyToOne } from 'typeorm';
import { ApiProperty, ApiBody } from '@nestjs/swagger';
import { BaseTrackingEntity } from 'src/shared/entities/base.tracking.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { User } from 'src/users/user.entity';
import { Project } from 'src/project/entities/project.entity';
import { ActivityDataStatus } from './enum/activity-data-status.enum';

export abstract class EmissionBaseEntity extends BaseTrackingEntity{

  @Column({ type: "double",default: 0 })
  e_sc_co2:number;

  @Column({ type: "double",default: 0 })
  e_sc_ch4:number;

  @Column({ type: "double",default: 0 })
  e_sc_n2o:number;

  @Column({ type: "double",default: 0 })
  e_sc:number;
  
  @Column({default: false})
  mobile: boolean;

  @Column({default: false})
  stationary: boolean;

  @ManyToOne((type) => User, { eager: true }) // do not remove eager: true
  @JoinColumn()
  user: User;

  @ManyToOne((type) => Unit, { eager: true }) // do not remove eager: true
  @JoinColumn()
  unit: Unit;

  @ManyToOne((type) => Project, { eager: true })
  @JoinColumn()
  project: Project;

  @Column({nullable: true})
  ownership: string;

  @Column({default: false})
  direct: boolean;

  @Column({default: false})
  indirect: boolean;

  @Column({default: false})
  other: boolean;

  @Column({default: ActivityDataStatus.DataEntered})
  activityDataStatus: ActivityDataStatus;
}

