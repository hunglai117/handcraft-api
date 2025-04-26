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
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { NotFoundResponseDto } from "../shared/shared.dto";
import { UserRole } from "../users/entities/user.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { CreateSimpleProductDto } from "./dto/create-simple-product.dto";
import {
  PaginatedProductResponseDto,
  ProductQueryDto,
} from "./dto/product-query.dto";
import { ProductDto } from "./dto/product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductsService } from "./products.service";
import { Public } from "../auth/decorators/public.decorator";

@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new product (admin only)" })
  @ApiBody({
    type: CreateProductDto,
  })
  @ApiResponse({
    status: 201,
    description: "The product has been created successfully.",
    type: ProductDto,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductDto> {
    const product = await this.productsService.create(createProductDto);
    return plainToInstance(ProductDto, product, {
      excludeExtraneousValues: true,
    });
  }

  @Post("simple")
  @ApiOperation({
    summary: "Create a simple product with a single variant (admin only)",
  })
  @ApiBody({
    type: CreateSimpleProductDto,
    description: "Simple product data with a single price point",
  })
  @ApiResponse({
    status: 201,
    description: "The simple product has been created successfully.",
    type: ProductDto,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createSimple(
    @Body() createSimpleProductDto: CreateSimpleProductDto,
  ): Promise<ProductDto> {
    const product = await this.productsService.createSimpleProduct(
      createSimpleProductDto,
    );
    return plainToInstance(ProductDto, product, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: "Get all products with filtering options" })
  @ApiResponse({
    status: 200,
    description: "Return all products matching the criteria.",
    type: PaginatedProductResponseDto,
  })
  @Public()
  async findAll(
    @Query() query: ProductQueryDto,
  ): Promise<PaginatedProductResponseDto> {
    const products = await this.productsService.findAll(query);
    return plainToInstance(PaginatedProductResponseDto, products, {
      excludeExtraneousValues: true,
    });
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
    type: ProductDto,
  })
  @ApiResponse({
    status: 404,
    description: "Product not found.",
    type: NotFoundResponseDto,
  })
  @Public()
  async findBySlug(@Param("slug") slug: string): Promise<ProductDto> {
    const resq = await this.productsService.findBySlug(slug);
    return plainToInstance(ProductDto, resq, {
      excludeExtraneousValues: true,
    });
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a product (admin only)" })
  @ApiBody({
    type: UpdateProductDto,
  })
  @ApiParam({
    name: "id",
    description: "Product ID",
    type: String,
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 200,
    description: "The product has been successfully updated.",
    type: ProductDto,
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
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductDto> {
    const resq = await this.productsService.update(id, updateProductDto);
    return plainToInstance(ProductDto, resq, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a product (admin only)" })
  @ApiParam({
    name: "id",
    description: "Product ID",
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
  async remove(@Param("id") id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
