import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/user.decorator";
import { User } from "../users/entities/user.entity";
import { ProductRatingsService } from "./product-ratings.service";
import {
  CreateProductRatingDto,
  ProductRatingDto,
  ProductRatingResponseDto,
  UpdateProductRatingDto,
} from "./dto/product-rating.dto";
import { plainToInstance } from "class-transformer";

@ApiTags("Product Ratings")
@Controller("products/:productId/ratings")
export class ProductRatingsController {
  constructor(private readonly ratingsService: ProductRatingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new product rating" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Rating created successfully",
    type: ProductRatingDto,
  })
  async create(
    @Param("productId") productId: string,
    @Body() createRatingDto: CreateProductRatingDto,
    @CurrentUser() user: User,
  ) {
    const rating = await this.ratingsService.create(
      productId,
      user.id,
      createRatingDto,
    );

    return plainToInstance(ProductRatingDto, rating, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: "Get all ratings for a product" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Ratings retrieved successfully",
    type: ProductRatingResponseDto,
  })
  async findAll(@Param("productId") productId: string) {
    const ratingResponse =
      await this.ratingsService.findAllForProduct(productId);

    return plainToInstance(ProductRatingResponseDto, ratingResponse, {
      excludeExtraneousValues: true,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific rating by ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Rating retrieved successfully",
    type: ProductRatingDto,
  })
  async findOne(@Param("id") id: string) {
    const rating = await this.ratingsService.findOne(id);
    return plainToInstance(ProductRatingDto, rating, {
      excludeExtraneousValues: true,
    });
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a rating" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Rating updated successfully",
    type: ProductRatingDto,
  })
  async update(
    @Param("id") id: string,
    @Body() updateRatingDto: UpdateProductRatingDto,
    @CurrentUser() user: User,
  ) {
    const rating = await this.ratingsService.update(
      id,
      user.id,
      updateRatingDto,
    );

    return plainToInstance(ProductRatingDto, rating, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a rating" })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Rating deleted successfully",
  })
  async remove(@Param("id") id: string, @CurrentUser() user: User) {
    await this.ratingsService.remove(id, user.id);
  }

  @Post(":id/helpful")
  @ApiOperation({ summary: "Mark a rating as helpful" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Rating marked as helpful",
    type: ProductRatingDto,
  })
  async markHelpful(@Param("id") id: string) {
    const rating = await this.ratingsService.markAsHelpful(id);
    return plainToInstance(ProductRatingDto, rating, {
      excludeExtraneousValues: true,
    });
  }

  @Post(":id/report")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Report a rating" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Rating reported successfully",
    type: ProductRatingDto,
  })
  async report(@Param("id") id: string) {
    const rating = await this.ratingsService.report(id);
    return plainToInstance(ProductRatingDto, rating, {
      excludeExtraneousValues: true,
    });
  }
}
