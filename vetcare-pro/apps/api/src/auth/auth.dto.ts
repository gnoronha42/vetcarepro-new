import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
}

export class RegisterDto {
  @IsString() @MinLength(2) name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @IsOptional() @IsIn(['admin', 'vet', 'recepcao']) role?: 'admin' | 'vet' | 'recepcao';
  @IsOptional() @IsString() crmv?: string;
}
