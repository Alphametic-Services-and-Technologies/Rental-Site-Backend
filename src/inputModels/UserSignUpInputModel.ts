import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import IsStrongPassword from '../utils/CustomValidations/PasswordValidator';

export class UserSignUpInputModel {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  gender!: string;

  @IsString()
  @IsStrongPassword()
  password!: string;
}
