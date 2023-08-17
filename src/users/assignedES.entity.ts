import {
  BaseEntity,
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTrackingEntity } from 'src/shared/entities/base.tracking.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { User } from './user.entity';
import { ProjectUnitEmissionSource } from 'src/project/entities/project-unit-emission-source.entity';

@Entity()
export class AssignedES extends BaseTrackingEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => User, { eager: false })
  @JoinColumn()
  user: User;

  @ManyToOne((type) => ProjectUnitEmissionSource, { eager: false })
  @JoinColumn()
  pues: ProjectUnitEmissionSource;
  
  @Column({default:false})
  add: boolean;
  
  @Column({default:false})
  edit: boolean;

  @Column({default:false})
  delete: boolean;

}
