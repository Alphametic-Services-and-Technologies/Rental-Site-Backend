import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../entities/User';

export class UpdateUserInputModel {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  gender!: string;

  @IsString()
  role!: UserRole;
}
