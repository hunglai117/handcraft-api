import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { UserProvider } from "./user-provider.entity";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

@Entity("users")
export class User extends BaseEntity {
  @Column({ name: "full_name", length: 100 })
  fullName: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ nullable: true })
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
  country: string;

  @OneToMany(() => UserProvider, (provider) => provider.user)
  providers: UserProvider[];
}
