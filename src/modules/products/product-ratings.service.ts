import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  CreateProductRatingDto,
  ProductRatingResponseDto,
  UpdateProductRatingDto,
} from "./dto/product-rating.dto";
import { ProductRating } from "./entities/product-rating.entity";
import { Product } from "./entities/product.entity";

@Injectable()
export class ProductRatingsService {
  constructor(
    @InjectRepository(ProductRating)
    private productRatingRepository: Repository<ProductRating>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  /**
   * Create a new product rating
   */
  async create(
    productId: string,
    userId: string,
    createRatingDto: CreateProductRatingDto,
  ): Promise<ProductRating> {
    // Check if product exists
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check if user has already rated this product
    const existingRating = await this.productRatingRepository.findOne({
      where: {
        productId,
        userId,
      },
    });

    if (existingRating) {
      throw new BadRequestException("You have already rated this product");
    }

    // Determine if this is a verified purchase
    // This would typically check order history, but for simplicity we'll just set it to false
    const isVerifiedPurchase = false;

    // Create rating
    const rating = this.productRatingRepository.create({
      productId,
      userId,
      rating: createRatingDto.rating,
      comment: createRatingDto.comment,
      isVerifiedPurchase,
    });

    await this.productRatingRepository.save(rating);

    // Update product's average rating
    await this.updateProductAverageRating(productId);

    return rating;
  }

  /**
   * Get all ratings for a product
   */
  async findAllForProduct(
    productId: string,
  ): Promise<ProductRatingResponseDto> {
    // Check if product exists
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Get all ratings for the product
    const ratings = await this.productRatingRepository.find({
      where: { productId },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });

    // Calculate distribution
    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    ratings.forEach((rating) => {
      distribution[rating.rating]++;
    });

    return {
      averageRating: product.rating,
      totalRatings: ratings.length,
      distribution,
      ratings,
    };
  }

  /**
   * Get a specific rating
   */
  async findOne(id: string): Promise<ProductRating> {
    const rating = await this.productRatingRepository.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }

    return rating;
  }

  /**
   * Update a rating
   */
  async update(
    id: string,
    userId: string,
    updateRatingDto: UpdateProductRatingDto,
  ): Promise<ProductRating> {
    const rating = await this.productRatingRepository.findOne({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }

    // Check if the rating belongs to the user
    if (rating.userId !== userId) {
      throw new BadRequestException("You can only update your own ratings");
    }

    // Update the rating
    if (updateRatingDto.rating) {
      rating.rating = updateRatingDto.rating;
    }

    if (updateRatingDto.comment !== undefined) {
      rating.comment = updateRatingDto.comment;
    }

    await this.productRatingRepository.save(rating);

    // Update product's average rating
    await this.updateProductAverageRating(rating.productId);

    return this.productRatingRepository.findOne({
      where: { id },
      relations: ["user"],
    });
  }

  /**
   * Delete a rating
   */
  async remove(id: string, userId: string): Promise<void> {
    const rating = await this.productRatingRepository.findOne({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }

    // Check if the rating belongs to the user
    if (rating.userId !== userId) {
      throw new BadRequestException("You can only delete your own ratings");
    }

    const productId = rating.productId;

    await this.productRatingRepository.remove(rating);

    // Update product's average rating
    await this.updateProductAverageRating(productId);
  }

  /**
   * Mark a rating as helpful
   */
  async markAsHelpful(id: string): Promise<ProductRating> {
    const rating = await this.productRatingRepository.findOne({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }

    rating.helpfulCount += 1;
    return this.productRatingRepository.save(rating);
  }

  /**
   * Report a rating
   */
  async report(id: string): Promise<ProductRating> {
    const rating = await this.productRatingRepository.findOne({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }

    rating.reportCount += 1;
    return this.productRatingRepository.save(rating);
  }

  /**
   * Update a product's average rating
   */
  private async updateProductAverageRating(productId: string): Promise<void> {
    // Get all ratings for the product
    const ratings = await this.productRatingRepository.find({
      where: { productId },
    });

    if (ratings.length === 0) {
      // No ratings, set to 0
      await this.productRepository.update(productId, { rating: 0 });
      return;
    }

    // Calculate average rating
    const totalRating = ratings.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / ratings.length;

    // Update product
    await this.productRepository.update(productId, {
      rating: Number(averageRating.toFixed(1)),
    });
  }
}
