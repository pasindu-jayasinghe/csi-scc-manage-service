import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class CapitalGoodsActivityData extends EmissionBaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  month: number;

  @Column()
  year: number;


  @Column({ nullable: true })
  type_of_cg: string;


  @Column({ nullable: true })
  category: string;

  @Column({ type: "double", default: 0, nullable: true })
  quantity: number;

  @Column({ nullable: true })
  quantity_unit: string


  @Column({ type: "double",nullable: true })
  user_input_ef: number;

  @Column({ nullable: true })
  user_input_ef_unit: string;

  @Column({ type: "double", default: 0 })
  emission: number;

  @Column({ nullable: true, default: 0 })
  groupNo: string





}
