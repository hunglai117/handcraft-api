import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import {
  BadRequestResponseDto,
  NotFoundResponseDto,
} from "../shared/shared.dto";
import { UserRole } from "../users/entities/user.entity";
import { CreatePromotionDto } from "./dto/create-promotion.dto";
import { PromotionDto } from "./dto/promotion.dto";
import { UpdatePromotionDto } from "./dto/update-promotion.dto";
import { ValidateCodePromotionResponseDto } from "./dto/validate-code.dto";
import { PromotionsService } from "./promotions.service";

@ApiTags("Promotions")
@Controller("promotions")
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new promotion (admin only)" })
  @ApiResponse({
    status: 201,
    description: "The promotion has been successfully created.",
    type: PromotionDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid input data.",
    type: BadRequestResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createPromotionDto: CreatePromotionDto,
  ): Promise<PromotionDto> {
    const promotion = await this.promotionsService.create(createPromotionDto);
    return plainToInstance(PromotionDto, promotion, {
      excludeExtraneousValues: true,
    });
  }

  @Get("validate/:code")
  @ApiOperation({ summary: "Validate a promotion code" })
  @ApiParam({
    name: "code",
    description: "Promotion code to validate",
    type: String,
    example: "SUMMER20",
  })
  @ApiResponse({
    status: 200,
    description: "Validation result for the promotion code.",
    type: ValidateCodePromotionResponseDto,
  })
  async validateCode(
    @Param("code") code: string,
  ): Promise<ValidateCodePromotionResponseDto> {
    const resp = await this.promotionsService.validatePromoCode(code);
    return plainToInstance(ValidateCodePromotionResponseDto, resp, {
      excludeExtraneousValues: true,
    });
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a promotion (admin only)" })
  @ApiParam({
    name: "id",
    description: "Promotion UUID",
    type: String,
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 200,
    description: "The promotion has been successfully updated.",
    type: PromotionDto,
  })
  @ApiResponse({
    status: 404,
    description: "Promotion not found.",
    type: NotFoundResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid input data.",
    type: BadRequestResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ): Promise<PromotionDto> {
    const promotion = await this.promotionsService.update(
      id,
      updatePromotionDto,
    );
    return plainToInstance(PromotionDto, promotion, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a promotion (admin only)" })
  @ApiParam({
    name: "id",
    description: "Promotion UUID",
    type: String,
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 204,
    description: "The promotion has been successfully deleted.",
  })
  @ApiResponse({
    status: 404,
    description: "Promotion not found.",
    type: NotFoundResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.promotionsService.remove(id);
  }

  @Patch(":id/toggle-active")
  @ApiOperation({ summary: "Toggle promotion active status (admin only)" })
  @ApiParam({
    name: "id",
    description: "Promotion UUID",
    type: String,
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 200,
    description: "Promotion active status toggled successfully.",
    type: PromotionDto,
  })
  @ApiResponse({
    status: 404,
    description: "Promotion not found.",
    type: NotFoundResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async toggleActive(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<PromotionDto> {
    const promotion = await this.promotionsService.toggleActive(id);
    return plainToInstance(PromotionDto, promotion, {
      excludeExtraneousValues: true,
    });
  }
}
