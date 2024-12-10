import { IsString } from 'class-validator';
import IsStrongPassword from '../utils/CustomValidations/PasswordValidator';

export class UpdatePasswordInputModel {
  @IsString()
  oldPassword!: string;

  @IsString()
  @IsStrongPassword()
  newPassword!: string;
}
