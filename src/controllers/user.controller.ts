import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import { UserSignUpInputModel } from '../inputModels/UserSignUpInputModel';
import appDataSource from '../config/dataSource';
import { User, UserRole } from '../entities/User';
import AppError from '../utils/AppError';
import { UserLoginInputModel } from '../inputModels/UserLoginInputModel';
import signToken from '../utils/Auth/signToken';
import { plainToInstance } from 'class-transformer';
import { UserDto } from '../dtos/UserDto';
import { UpdateProfileInputModel } from '../inputModels/UpdateProfileInputModel';
import { UpdatePasswordInputModel } from '../inputModels/UpdatePasswordInputModel';
import { ForgotPasswordInputModel } from '../inputModels/ForgotPasswordInputModel';
import Email from '../utils/Email';
import { createHash } from 'crypto';
import { MoreThan } from 'typeorm';
import { ResetPasswordInputModel } from '../inputModels/ResetPasswordInputModel';
import dayjs from 'dayjs';
import { UpdateUserInputModel } from '../inputModels/UpdateUserInputModel';
import { APIFeatures } from '../utils/ApiFeatures';
import { GetUsersQueryParams } from '../inputModels/GetUsersQueryParams';

const userRepository = appDataSource.getRepository(User);

const registerUser = catchAsync(
  async (
    req: Request<unknown, unknown, UserSignUpInputModel>,
    res: Response,
    next: NextFunction
  ) => {
    const userWithSameEmail = await userRepository.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!!userWithSameEmail) {
      next(
        new AppError(
          'User with the same email already exists',
          httpStatus.BAD_REQUEST
        )
      );
    }

    const newUser = userRepository.create({
      name: req.body.name,
      gender: req.body.gender,
      email: req.body.email,
      role: UserRole.User,
      password: req.body.password,
      avatar: req.file?.filename,
    });

    const user = await userRepository.save(newUser);

    const transformedUser = plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
    const token = signToken(user.id);

    res.status(httpStatus.OK).json({ user: transformedUser, token });
  }
);

const login = catchAsync(
  async (
    req: Request<unknown, unknown, UserLoginInputModel>,
    res: Response,
    next: NextFunction
  ) => {
    const { email, password } = req.body;

    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      return next(
        new AppError('Wrong email or password', httpStatus.BAD_REQUEST)
      );
    }

    const isPasswordCorrect = await user.checkPassword(password);

    if (!isPasswordCorrect) {
      return next(
        new AppError('Wrong email or password', httpStatus.BAD_REQUEST)
      );
    }

    const transformedUser = plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
    const token = signToken(user.id);

    res.status(httpStatus.OK).json({
      user: transformedUser,
      token,
    });
  }
);

const getUser = catchAsync(
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = await userRepository.findOneBy({ id });

    if (!user) {
      return next(
        new AppError(`User with id: ${id} was not found`, httpStatus.NOT_FOUND)
      );
    }

    const transformedUser = plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });

    res.status(httpStatus.OK).json(transformedUser);
  }
);

const getLoggedInUserDetails = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user!;

    const user = await userRepository.findOneBy({ id });

    if (!user) {
      next(new AppError('User not found', httpStatus.NOT_FOUND));
    }

    const transformedUser = plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });

    res.status(httpStatus.OK).json(transformedUser);
  }
);

const updateLoggedInUserDetails = catchAsync(
  async (
    req: Request<unknown, unknown, UpdateProfileInputModel>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.user!;

    const { email, gender, name } = req.body;

    const user = await userRepository.findOneBy({ id });

    if (!user) {
      return next(new AppError('User not found', httpStatus.NOT_FOUND));
    }

    user.email = email;
    user.gender = gender;
    user.name = name;

    if (req.file) {
      user.avatar = req.file.filename;
    }

    const updatedUser = await userRepository.save(user);

    const transformedUser = plainToInstance(UserDto, updatedUser, {
      excludeExtraneousValues: true,
    });

    res.status(httpStatus.OK).json(transformedUser);
  }
);

const updatePassword = catchAsync(
  async (
    req: Request<unknown, unknown, UpdatePasswordInputModel>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.user!;
    const { newPassword, oldPassword } = req.body;

    const user = await userRepository.findOneBy({ id });

    if (!user) {
      return next(new AppError('User not found', httpStatus.NOT_FOUND));
    }

    const passwordMatched = await user.checkPassword(oldPassword);

    if (!passwordMatched) {
      return next(
        new AppError('Old Password is Invalid', httpStatus.BAD_REQUEST)
      );
    }

    user.password = newPassword;
    user.passwordChangedAt = dayjs().toDate();

    const updatedUser = await userRepository.save(user);

    const transformedUser = plainToInstance(UserDto, updatedUser, {
      excludeExtraneousValues: true,
    });
    const token = signToken(user.id);

    res.status(httpStatus.OK).json({
      user: transformedUser,
      token,
    });
  }
);

const forgotPassword = catchAsync(
  async (
    req: Request<unknown, unknown, ForgotPasswordInputModel>,
    res: Response,
    next: NextFunction
  ) => {
    const { email } = req.body;

    const user = await userRepository.findOneBy({ email });

    if (!user) {
      return next(new AppError('User not found', httpStatus.NOT_FOUND));
    }

    const resetToken = user.generateResetPasswordToken();

    await userRepository.save(user);

    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/users/reset-password/${resetToken}`;

    const message = `submit a patch request with your new password and confirm new password to ${resetURL}`;

    try {
      const email = new Email(user, resetURL);

      await email.send('passwordReset', message);

      res.status(httpStatus.OK).json({ message: 'Email sent' });
    } catch (err) {
      user.resetPasswordToken = null as any;
      user.resetPasswordTokenExpires = null as any;

      await userRepository.save(user);

      return next(
        new AppError(
          'there was an error sending the email try again later',
          httpStatus.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);

const resetPassword = catchAsync(
  async (
    req: Request<{ token: string }, unknown, ResetPasswordInputModel>,
    res: Response,
    next: NextFunction
  ) => {
    const { token: resetPasswordToken } = req.params;

    const { newPassword } = req.body;

    const hashedToken = createHash('sha256')
      .update(resetPasswordToken)
      .digest('hex');

    const user = await userRepository.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordTokenExpires: MoreThan(Date.now()),
      },
    });

    if (!user) {
      return next(new AppError('Token is invalid', httpStatus.BAD_REQUEST));
    }

    user.password = newPassword;
    user.resetPasswordToken = null as any;
    user.resetPasswordTokenExpires = null as any;
    user.passwordChangedAt = dayjs().toDate();

    const updatedUser = await userRepository.save(user);

    const transformedUser = plainToInstance(UserDto, updatedUser, {
      excludeExtraneousValues: true,
    });
    const token = signToken(updatedUser.id);

    res.status(httpStatus.OK).json({ user: transformedUser, token });
  }
);

const updateUser = catchAsync(
  async (
    req: Request<{ id: string }, unknown, UpdateUserInputModel>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;

    const { email, gender, name, role } = req.body;

    const user = await userRepository.findOneBy({ id });

    if (!user) {
      return next(new AppError('User not found', httpStatus.NOT_FOUND));
    }

    user.email = email;
    user.gender = gender;
    user.name = name;
    user.role = role;

    const updatedUser = await userRepository.save(user);

    const transformedUser = plainToInstance(UserDto, updatedUser, {
      excludeExtraneousValues: true,
    });

    res.status(httpStatus.OK).json(transformedUser);
  }
);

const archiveUser = catchAsync(
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = await userRepository.findOneBy({ id });

    if (!user) {
      return next(new AppError('User not found', httpStatus.NOT_FOUND));
    }

    await userRepository.softDelete({ id: user.id });

    res.status(httpStatus.NO_CONTENT).json();
  }
);

const getUsers = catchAsync(
  async (
    req: Request<unknown, unknown, unknown, GetUsersQueryParams>,
    res: Response
  ) => {
    const { page, pageSize, sortField, sortDir, searchTerm, fields } =
      req.query;

    const query = new APIFeatures('Users', userRepository)
      .paginate(page, pageSize)
      .sort(sortField, sortDir)
      .search(searchTerm, 'name', 'email', 'gender')
      .limitFields(fields);

    const response = await query.getResponse(UserDto);

    res.status(httpStatus.OK).json(response);
  }
);

export default {
  registerUser,
  login,
  getUser,
  getLoggedInUserDetails,
  updateLoggedInUserDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  updateUser,
  archiveUser,
  getUsers,
};
