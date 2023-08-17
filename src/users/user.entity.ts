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

@Entity()
export class User extends BaseTrackingEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: true})
  firstName: string;
 
  @Column({nullable: true})
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({nullable: true})
  telephone: string;

  @Column({ nullable: true })
  designation: string;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ default: 0 })
  canNotDelete?: boolean;

  @ManyToOne((type) => Unit, { eager: false }) //  dont change eager: false
  @JoinColumn()
  unit: Unit;

  @Column({ nullable: false, unique: true })
  loginProfile: string;

  @Column({ nullable: true, default:"0"})
  allowedSelectUnits: string;

  @Column({ nullable: true, default:"0"})
  allowedFPProjects: string;

  getAllowedSelectUnits(){
    return this.allowedSelectUnits.split(",") as unknown as number[]
  }

  getAllowedFPProjects(){
    return this.allowedFPProjects.split(",") as unknown as number[]
  }


  get fullname(): string {      
    return this.firstName + (this.lastName ? ' ' + this.lastName : '');
  }


}
