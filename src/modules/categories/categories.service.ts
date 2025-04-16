import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoryDto } from "./dto/category.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { Category } from "./entities/category.entity";
import slugify from "slugify";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto);

    if (!category.id) {
      category.generateId();
    }

    category.pathUrl = `${slugify(category.name, { lower: true })}-c${category.id}`;

    if (createCategoryDto.parentId) {
      const parent = await this.findOne(
        createCategoryDto.parentId,
        false,
        false,
      );

      if (parent) {
        if (parent.isLeaf) {
          parent.isLeaf = false;
          await this.categoryRepository.save(parent);
        }
      }
    }

    return this.categoryRepository.save(category);
  }

  async findOne(id: string, includeChildren: boolean, includeParent: boolean) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ["parent", "children"],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (includeParent && category.parentId) {
      const parents = await this.getParentHierarchy(category.parentId);
      (category as CategoryDto).parents = parents;
    }

    if (includeChildren && category.children && category.children.length > 0) {
      (category as CategoryDto).children = await Promise.all(
        category.children.map((child) => this.findOne(child.id, true, false)),
      );
    }

    return category;
  }

  getMenuCategories(): CategoryDto[] | PromiseLike<CategoryDto[]> {
    return this.categoryRepository
      .createQueryBuilder("category")
      .where("category.parentId IS NULL")
      .orderBy("category.name", "ASC")
      .getMany();
  }

  async getLeafCategoriesId(ancestorId: string): Promise<string[]> {
    const leafCategories: string[] = [];
    const ancestor = await this.categoryRepository.findOne({
      where: { id: ancestorId },
      relations: ["children"],
    });

    if (!ancestor) {
      throw new NotFoundException(`Category with ID ${ancestorId} not found`);
    }

    const children = ancestor.children;

    if (children && children.length > 0) {
      for (const child of children) {
        const childLeafCategories = await this.getLeafCategoriesId(child.id);
        leafCategories.push(...childLeafCategories);
      }
    } else {
      leafCategories.push(ancestor.id);
    }

    return leafCategories;
  }

  private async getParentHierarchy(categoryId: string): Promise<Category[]> {
    const parents: Category[] = [];
    let currentCategoryId = categoryId;

    while (currentCategoryId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: currentCategoryId },
      });

      if (!parent) {
        break;
      }

      parents.unshift(parent);
      currentCategoryId = parent.parentId;
    }

    return parents;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id, false, false);
    const nameChanged =
      updateCategoryDto.name && updateCategoryDto.name !== category.name;
    const parentChanged =
      updateCategoryDto.parentId !== undefined &&
      updateCategoryDto.parentId !== category.parentId;

    if (parentChanged) {
      // If old parent exists, we need to check if it still has other children
      if (category.parentId) {
        const oldParentChildren = await this.categoryRepository.count({
          where: { parentId: category.parentId },
        });

        // If this was the only child, set old parent's isLeaf to true
        if (oldParentChildren <= 1) {
          const oldParent = await this.findOne(category.parentId, false, false);
          oldParent.isLeaf = true;
          await this.categoryRepository.save(oldParent);
        }
      }

      // If new parent is assigned, make sure it's marked as not a leaf
      if (updateCategoryDto.parentId) {
        const newParent = await this.findOne(
          updateCategoryDto.parentId,
          false,
          false,
        );
        if (newParent.isLeaf) {
          newParent.isLeaf = false;
          await this.categoryRepository.save(newParent);
        }
      }
    }

    Object.assign(category, updateCategoryDto);

    if (nameChanged) {
      category.pathUrl = `${slugify(category.name, { lower: true })}-c${category.id}`;
    }

    return this.categoryRepository.save(category);
  }
}
