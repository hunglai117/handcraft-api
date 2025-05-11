import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoriesService } from "../../categories/categories.service";
import { CreateCategoryDto } from "../../categories/dto/create-category.dto";
import { UpdateCategoryDto } from "../../categories/dto/update-category.dto";
import { Category } from "../../categories/entities/category.entity";

@Injectable()
export class AdminCategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAll() {
    return this.categoryRepository.find({
      order: { name: "ASC" },
    });
  }

  async findOne(
    id: string,
    includeChildren: boolean = true,
    includeParents: boolean = true,
  ) {
    return this.categoriesService.findOne(id, includeChildren, includeParents);
  }

  async create(createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id, false, false);
    return this.categoriesService.update(id, updateCategoryDto);
  }

  async remove(id: string) {
    const category = await this.findOne(id, true, false);

    // Check if the category has children
    if (category.children && category.children.length > 0) {
      throw new Error(
        "Cannot delete a category that has child categories. Please delete or reassign child categories first.",
      );
    }

    // Check if the category has products
    const productsCount = await this.categoryRepository
      .createQueryBuilder("category")
      .leftJoin("category.products", "product")
      .where("category.id = :id", { id })
      .andWhere("product.id IS NOT NULL")
      .getCount();

    if (productsCount > 0) {
      throw new Error(
        "Cannot delete a category that has products. Please reassign or delete these products first.",
      );
    }

    // Delete the category
    await this.categoryRepository.delete(id);
    return { id };
  }

  async getCategoryTree() {
    // Implement a tree structure here
    const rootCategories = await this.categoryRepository.find({
      where: { parentId: null },
      relations: ["children"],
      order: { name: "ASC" },
    });

    return rootCategories;
  }

  async getCategoryStats() {
    // Get total category count
    const totalCategories = await this.categoryRepository.count();

    // Get categories with products count
    const categoriesWithProducts = await this.categoryRepository
      .createQueryBuilder("category")
      .leftJoin("category.products", "product")
      .select("category.id")
      .addSelect("category.name", "name")
      .addSelect("COUNT(DISTINCT product.id)", "productCount")
      .groupBy("category.id")
      .getRawMany();

    // Get parent-child structure
    const categoriesWithChildren = await this.categoryRepository
      .createQueryBuilder("category")
      .leftJoin("category.parent", "parent")
      .select("parent.name", "parentName")
      .addSelect("COUNT(category.id)", "childCount")
      .where("parent.id IS NOT NULL")
      .groupBy("parent.name")
      .getRawMany();

    // Get root categories (categories without parents)
    const rootCategories = await this.categoryRepository
      .createQueryBuilder("category")
      .where("category.parentId IS NULL")
      .getCount();

    return {
      totalCategories,
      rootCategories,
      categoriesWithProducts,
      categoriesWithChildren,
    };
  }
}
