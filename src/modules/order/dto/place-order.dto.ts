import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
  ArrayMinSize,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { PaymentInfoDto } from "./payment-info.dto";

// export class ApplyPromotionDto {
//   @ApiProperty({
//     description: "Promotion code to apply",
//     example: "SUMMER20",
//   })
//   @IsString()
//   @IsNotEmpty()
//   @Expose()
//   code: string;
// }

export class InfoDto {
  @ApiProperty({
    description: "Phone number",
    example: "123-456-7890",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  phone: string;

  @ApiProperty({
    description: "Street address",
    example: "123 Main St, Apt 4B",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  address: string;

  @ApiProperty({
    description: "City",
    example: "New York",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  city: string;

  @ApiProperty({
    description: "Country",
    example: "USA",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  country: string;
}

export class PlaceOrderDto {
  @ApiProperty({
    description: "Shipping address information",
    type: InfoDto,
  })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => InfoDto)
  @Expose()
  shippingInfo: InfoDto;

  @ApiProperty({
    description: "Billing address information",
    type: InfoDto,
  })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => InfoDto)
  @Expose()
  billingInfo: InfoDto;

  // @ApiPropertyOptional({
  //   description: "Promotion code to apply to the order",
  //   type: ApplyPromotionDto,
  // })
  // @IsOptional()
  // @ValidateNested()
  // @Type(() => ApplyPromotionDto)
  // @Expose()
  // promotion?: ApplyPromotionDto;

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

  @ApiProperty({
    description: "List of order items",
    type: [String],
  })
  @IsNotEmpty()
  @Type(() => String)
  @ArrayMinSize(1, { message: "Order must contain at least 1 item" })
  @Expose()
  items: string[];
}
