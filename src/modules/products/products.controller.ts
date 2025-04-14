import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Patch,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductQueryDto } from "./dto/product-query.dto";
import { Product } from "./entities/product.entity";

@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new product" })
  @ApiResponse({
    status: 201,
    description: "The product has been created successfully.",
  })
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all products with filtering options" })
  @ApiResponse({
    status: 200,
    description: "Return all products matching the criteria.",
  })
  async findAll(
    @Query() query: ProductQueryDto
  ): Promise<{ data: Product[]; total: number }> {
    const [products, count] = await this.productsService.findAll(query);
    return {
      data: products,
      total: count,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a product by ID" })
  @ApiResponse({ status: 200, description: "Return the product." })
  @ApiResponse({ status: 404, description: "Product not found." })
  findOne(@Param("id", ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a product" })
  @ApiResponse({
    status: 200,
    description: "The product has been successfully updated.",
  })
  @ApiResponse({ status: 404, description: "Product not found." })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a product" })
  @ApiResponse({
    status: 204,
    description: "The product has been successfully deleted.",
  })
  @ApiResponse({ status: 404, description: "Product not found." })
  remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.productsService.remove(id);
  }
}
