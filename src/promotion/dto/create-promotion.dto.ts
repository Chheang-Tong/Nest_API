import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import * as entities from '../entities';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  code: string; // UPPERCASE code

  @IsEnum(['PERCENT', 'FIXED'])
  type: entities.PromotionType;

  @IsNumber()
  @Min(0)
  value: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minOrderTotal?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
