import { Expose, Exclude, Transform } from 'class-transformer';
import { UserRole } from '../entities/User';
import dayjs from 'dayjs';

export class UserDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  email!: string;

  @Expose()
  gender!: string;

  @Exclude()
  password!: string;

  // Avatar // I must think about this

  @Expose()
  role!: UserRole;

  @Expose()
  @Transform(({ value }) => dayjs(value).format('DD.MM.YYYY'))
  createdAt!: Date;

  @Expose()
  @Transform(({ value }) => dayjs(value).format('DD.MM.YYYY'))
  updatedAt!: Date;

  @Exclude()
  deletedAt!: Date;

  @Exclude()
  resetPasswordToken!: string;

  @Exclude()
  resetPasswordTokenDate!: Date;

  @Exclude()
  passwordChangedAt!: Date;

  @Expose()
  @Transform(({ value }) => {
    return value ? `${process.env.BASE_URL}/images/${value}` : undefined;
  })
  avatar!: string;
}
