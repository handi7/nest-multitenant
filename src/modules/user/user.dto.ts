import { PartialType } from "@nestjs/mapped-types";
import { IsEmail, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
  @MaxLength(18, { message: "Name max. length is 18 chars." })
  @MinLength(3, { message: "Name min. length is 3 chars." })
  @IsString({ message: "name must be string." })
  @IsNotEmpty({ message: "Name is required." })
  name: string;

  @IsEmail({}, { message: "Invalid email." })
  @IsString({ message: "email must be string." })
  @IsNotEmpty({ message: "Email is required." })
  email: string;

  @MaxLength(18, { message: "Password max. length is 18 chars." })
  @MinLength(6, { message: "Password min. length is 6 chars." })
  @IsString({ message: "password must be string." })
  @IsNotEmpty({ message: "Password is required" })
  password: string;

  @IsUUID("4", { message: "Invalid role." })
  @IsNotEmpty({ message: "Role is required." })
  role_id: string;

  @IsUUID("4", { message: "Invalid branch." })
  @IsNotEmpty({ message: "Branch is required." })
  branch_id: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
