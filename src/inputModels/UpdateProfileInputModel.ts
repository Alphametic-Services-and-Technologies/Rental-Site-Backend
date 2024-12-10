import { IsEmail, IsString } from 'class-validator';

export class UpdateProfileInputModel {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  gender!: string;
}
