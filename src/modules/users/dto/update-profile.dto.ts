import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
  
  @IsOptional()
  @IsString()
  phone?: string;
  
  @IsOptional()
  @IsString()
  address?: string;
  
  @IsOptional()
  @IsString()
  city?: string;
  
  @IsOptional()
  @IsString()
  state?: string;
  
  @IsOptional()
  @IsString()
  zip?: string;
  
  @IsOptional()
  @IsString()
  country?: string;
}
