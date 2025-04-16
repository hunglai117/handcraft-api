import { Column, Entity, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

@Entity("users")
export class User extends BaseEntity {
  @Column({ name: "first_name", length: 50 })
  firstName: string;

  @Column({ name: "last_name", length: 50 })
  lastName: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column()
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, length: 255 })
  address: string;

  @Column({ nullable: true, length: 100 })
  city: string;

  @Column({ nullable: true, length: 100 })
  state: string;

  @Column({ nullable: true, length: 20 })
  zip: string;

  @Column({ nullable: true, length: 100 })
  country: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
