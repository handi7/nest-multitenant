import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString } from "class-validator";

export class PaginationQueryDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  sortOrder?: "asc" | "desc";
}
