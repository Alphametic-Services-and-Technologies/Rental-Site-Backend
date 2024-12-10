import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import dayjs from 'dayjs';

export enum UserRole {
  Admin = 'Admin',
  User = 'User',
}

@Entity('User')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: false, unique: true })
  email!: string;

  @Column({ nullable: true })
  gender!: string;

  @Column({ nullable: true })
  password!: string;

  @Column({ nullable: true })
  avatar!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;

  @Column({ nullable: true })
  resetPasswordToken!: string;

  @Column({ nullable: true, type: 'bigint' })
  resetPasswordTokenExpires!: number;

  @Column({ nullable: true })
  passwordChangedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (!this.password) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  async checkPassword(planPassword: string): Promise<boolean> {
    return await bcrypt.compare(planPassword, this.password);
  }

  changedPasswordAfter(jwtTimeStamp: number): boolean {
    if (!this.passwordChangedAt) return false;

    const passwordChangedTimeStamp = this.passwordChangedAt.getTime() / 1000;

    return jwtTimeStamp < passwordChangedTimeStamp;
  }

  generateResetPasswordToken() {
    const resetToken = randomBytes(32).toString('hex');

    this.resetPasswordToken = createHash('sha256')
      .update(resetToken)
      .digest('hex');

    this.resetPasswordTokenExpires = dayjs().add(10, 'minutes').valueOf();

    return resetToken;
  }
}
