import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { NotFoundResponseDto } from "../shared/shared.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductQueryDto } from "./dto/product-query.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";
import { ProductsService } from "./products.service";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UserRole } from "../users/entities/user.entity";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new product (admin only)" })
  @ApiResponse({
    status: 201,
    description: "The product has been created successfully.",
    type: Product,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all products with filtering options" })
  @ApiResponse({
    status: 200,
    description: "Return all products matching the criteria.",
  })
  async findAll(
    @Query() query: ProductQueryDto,
  ): Promise<{ data: Product[]; total: number }> {
    const [products, count] = await this.productsService.findAll(query);
    return {
      data: products,
      total: count,
    };
  }

  @Get("slug/:slug")
  @ApiOperation({ summary: "Get a product by slug" })
  @ApiParam({
    name: "slug",
    description: "Product slug",
    type: String,
    example: "handcrafted-wooden-bowl",
  })
  @ApiResponse({
    status: 200,
    description: "Return the product.",
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: "Product not found.",
    type: NotFoundResponseDto,
  })
  async findBySlug(@Param("slug") slug: string): Promise<Product> {
    return this.productsService.findBySlug(slug);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a product (admin only)" })
  @ApiParam({
    name: "id",
    description: "Product UUID",
    type: String,
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 200,
    description: "The product has been successfully updated.",
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: "Product not found.",
    type: NotFoundResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a product (admin only)" })
  @ApiParam({
    name: "id",
    description: "Product UUID",
    type: String,
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 204,
    description: "The product has been successfully deleted.",
  })
  @ApiResponse({
    status: 404,
    description: "Product not found.",
    type: NotFoundResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
