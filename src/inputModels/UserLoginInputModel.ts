import { IsEmail, IsString } from 'class-validator';

export class UserLoginInputModel {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
