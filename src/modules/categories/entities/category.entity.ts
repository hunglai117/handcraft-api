import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

@Entity("categories")
export class Category extends BaseEntity {
  @Column({ length: 255, nullable: false })
  name: string;

  @Column({ length: 255, nullable: false, name: "slug" })
  slug: string;

  @Column({ type: "text", nullable: true })
  image: string;

  @Column({ type: "bigint", nullable: true, name: "parent_id" })
  parentId: string;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn({ name: "parent_id" })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @Column({ default: true, name: "is_leaf" })
  isLeaf: boolean;

  @Column({ default: 0, name: "products_count" })
  productsCount: number;
}
