import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { AddressDto } from "./address.dto";
import { PaymentInfoDto } from "./payment-info.dto";

export class ApplyPromotionDto {
  @ApiProperty({
    description: "Promotion code to apply",
    example: "SUMMER20",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  code: string;
}

export class PlaceOrderDto {
  @ApiProperty({
    description: "Shipping address information",
    type: AddressDto,
  })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  @Expose()
  shippingAddress: AddressDto;

  @ApiProperty({
    description: "Billing address information",
    type: AddressDto,
  })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  @Expose()
  billingAddress: AddressDto;

  @ApiPropertyOptional({
    description: "Promotion code to apply to the order",
    type: ApplyPromotionDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ApplyPromotionDto)
  @Expose()
  promotion?: ApplyPromotionDto;

  @ApiProperty({
    description: "Payment information",
    type: PaymentInfoDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PaymentInfoDto)
  @Expose()
  paymentInfo: PaymentInfoDto;

  @ApiPropertyOptional({
    description: "Notes for the order",
    example: "Please leave package at the door",
  })
  @IsOptional()
  @IsString()
  @Expose()
  notes?: string;
}
