import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @MaxLength(18, { message: 'Name max. length is 18 chars.' })
  @MinLength(3, { message: 'Name min. length is 3 chars.' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @MaxLength(18, { message: 'Password max. length is 18 chars.' })
  @MinLength(6, { message: 'Password min. length is 6 chars.' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @MaxLength(18, { message: 'Tenant name max. length is 18 chars.' })
  @MinLength(3, { message: 'Tenant name min. length is 3 chars.' })
  @IsNotEmpty({ message: 'Tenant name is required' })
  tenant_name: string;
}
