import { IsString } from 'class-validator';
import IsStrongPassword from '../utils/CustomValidations/PasswordValidator';

export class ResetPasswordInputModel {
  @IsString()
  @IsStrongPassword()
  newPassword!: string;
}
