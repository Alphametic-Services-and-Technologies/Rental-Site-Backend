import { IsEmail, IsString } from 'class-validator';

export class ForgotPasswordInputModel {
  @IsEmail()
  email!: string;
}
