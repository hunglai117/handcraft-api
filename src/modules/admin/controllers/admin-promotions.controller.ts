import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
import { AdminPromotionService } from "../services/admin-promotion.service";
import { CreatePromotionDto } from "../../promotions/dto/create-promotion.dto";
import { UpdatePromotionDto } from "../../promotions/dto/update-promotion.dto";

@ApiTags("admin/promotions")
@Controller("admin/promotions")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminPromotionsController {
  constructor(private readonly adminPromotionService: AdminPromotionService) {}

  @Get()
  @ApiOperation({ summary: "Get all promotions including inactive ones" })
  @ApiResponse({
    status: 200,
    description: "Return all promotions",
  })
  async findAll(@Query("includeInactive") includeInactive: boolean = true) {
    return this.adminPromotionService.findAll(includeInactive);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get promotion statistics" })
  @ApiResponse({
    status: 200,
    description: "Return promotion statistics",
  })
  async getPromotionStats() {
    return this.adminPromotionService.getPromotionStats();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific promotion" })
  @ApiParam({
    name: "id",
    description: "Promotion ID",
    type: String,
  })
  @ApiResponse({ status: 200, description: "Return the promotion" })
  @ApiResponse({ status: 404, description: "Promotion not found" })
  async findOne(@Param("id") id: string) {
    return this.adminPromotionService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new promotion" })
  @ApiResponse({ status: 201, description: "Promotion created successfully" })
  async create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.adminPromotionService.create(createPromotionDto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a promotion" })
  @ApiParam({
    name: "id",
    description: "Promotion ID",
    type: String,
  })
  @ApiResponse({ status: 200, description: "Promotion updated successfully" })
  @ApiResponse({ status: 404, description: "Promotion not found" })
  async update(
    @Param("id") id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ) {
    return this.adminPromotionService.update(id, updatePromotionDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a promotion" })
  @ApiParam({
    name: "id",
    description: "Promotion ID",
    type: String,
  })
  @ApiResponse({ status: 200, description: "Promotion deleted successfully" })
  @ApiResponse({ status: 404, description: "Promotion not found" })
  async remove(@Param("id") id: string) {
    return this.adminPromotionService.remove(id);
  }

  @Post(":id/toggle-active")
  @ApiOperation({ summary: "Toggle promotion active status" })
  @ApiParam({
    name: "id",
    description: "Promotion ID",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Promotion status toggled successfully",
  })
  @ApiResponse({ status: 404, description: "Promotion not found" })
  async toggleActive(@Param("id") id: string) {
    return this.adminPromotionService.toggleActive(id);
  }
}
