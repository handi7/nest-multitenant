import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateBranchDto {
  @MaxLength(30, { message: "Must not exceed 30 characters." })
  @MinLength(3, { message: "Must be at least 3 characters long." })
  @IsString({ message: "Branch name must be a string." })
  @IsNotEmpty({ message: "Branch name is required." })
  name: string;
}

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}
