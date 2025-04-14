import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDecimal, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'The name of the product', example: 'Handcrafted Wooden Bowl' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ 
    description: 'Detailed description of the product', 
    example: 'Beautiful handcrafted wooden bowl made from oak wood',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'The price of the product', example: 29.99 })
  @IsDecimal({ decimal_digits: '2' })
  @IsNotEmpty()
  price: number;

  @ApiProperty({ 
    description: 'URL of the product image', 
    example: 'https://example.com/images/wooden-bowl.jpg',
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(2083)
  imageURL?: string;

  @ApiProperty({ 
    description: 'Materials used to make the product', 
    example: 'Oak wood, natural varnish',
    required: false
  })
  @IsString()
  @IsOptional()
  materials?: string;

  @ApiProperty({ 
    description: 'Product availability status', 
    example: true,
    default: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  availability?: boolean;

  @ApiProperty({ 
    description: 'Product category', 
    example: 'Kitchen',
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @ApiProperty({ 
    description: 'Shipping information', 
    example: 'Free shipping for orders above $50',
    required: false
  })
  @IsString()
  @IsOptional()
  shippingInfo?: string;

  @ApiProperty({ 
    description: 'Tax information', 
    example: 'Subject to 5% GST',
    required: false
  })
  @IsString()
  @IsOptional()
  taxInfo?: string;
}
