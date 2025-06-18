import { IsArray, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateRoleDto {
  @MaxLength(18, { message: "Role name max. length is 18 digits." })
  @MinLength(3, { message: "Role name min. length is 3 digits." })
  @IsString({ message: "name must be string." })
  @IsNotEmpty({ message: "Role name is required." })
  name: string;

  @IsString({ each: true, message: "Each permission must be a string" })
  @IsArray({ message: "permissions must be an array" })
  @IsNotEmpty({ message: "Permissions is required" })
  permissions: string[];
}
