import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDecimal, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({ description: 'The name of the product', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ description: 'Detailed description of the product', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'The price of the product', required: false })
  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  price?: number;

  @ApiProperty({ description: 'URL of the product image', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(2083)
  imageURL?: string;

  @ApiProperty({ description: 'Materials used to make the product', required: false })
  @IsString()
  @IsOptional()
  materials?: string;

  @ApiProperty({ description: 'Product availability status', required: false })
  @IsBoolean()
  @IsOptional()
  availability?: boolean;

  @ApiProperty({ description: 'Product category', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @ApiProperty({ description: 'Shipping information', required: false })
  @IsString()
  @IsOptional()
  shippingInfo?: string;

  @ApiProperty({ description: 'Tax information', required: false })
  @IsString()
  @IsOptional()
  taxInfo?: string;
}
