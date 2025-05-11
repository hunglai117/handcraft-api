import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { AdminGuard } from "../../auth/guards/admin.guard";
import { AdminProductService } from "../services/admin-product.service";
import { CreateProductDto } from "../../products/dto/create-product.dto";
import { UpdateProductDto } from "../../products/dto/update-product.dto";
import { ProductQueryDto } from "../../products/dto/product-query.dto";

@ApiTags("admin/products")
@Controller("admin/products")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminProductsController {
  constructor(private readonly adminProductService: AdminProductService) {}

  @Get()
  @ApiOperation({ summary: "Get all products with pagination and filters" })
  @ApiResponse({
    status: 200,
    description: "Return paginated products",
  })
  async findAll(@Query() queryDto: ProductQueryDto) {
    return this.adminProductService.findAll(queryDto);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get product statistics" })
  @ApiResponse({
    status: 200,
    description: "Return product statistics",
  })
  async getProductStats() {
    return this.adminProductService.getProductStats();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a product by ID" })
  @ApiParam({
    name: "id",
    description: "Product ID",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Return the product",
  })
  @ApiResponse({
    status: 404,
    description: "Product not found",
  })
  async findOne(@Param("id") id: string) {
    return this.adminProductService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new product" })
  @ApiResponse({
    status: 201,
    description: "The product has been successfully created",
  })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.adminProductService.create(createProductDto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a product" })
  @ApiParam({
    name: "id",
    description: "Product ID",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "The product has been successfully updated",
  })
  @ApiResponse({
    status: 404,
    description: "Product not found",
  })
  async update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.adminProductService.update(id, updateProductDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a product" })
  @ApiParam({
    name: "id",
    description: "Product ID",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "The product has been successfully deleted",
  })
  @ApiResponse({
    status: 404,
    description: "Product not found",
  })
  async remove(@Param("id") id: string) {
    return this.adminProductService.remove(id);
  }
}
