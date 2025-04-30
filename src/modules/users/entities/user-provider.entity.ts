import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { User } from "./user.entity";

export enum ProviderType {
  GOOGLE = "google",
  FACEBOOK = "facebook",
}

@Entity("user_providers")
export class UserProvider extends BaseEntity {
  @ManyToOne(() => User, (user) => user.providers, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "user_id" })
  userId: string;

  @Column({
    type: "enum",
    enum: ProviderType,
  })
  provider: ProviderType;

  @Column({ name: "provider_user_id", length: 255 })
  providerUserId: string;

  @Column({ name: "provider_data", type: "json", nullable: true })
  providerData: Record<string, any>;
}
