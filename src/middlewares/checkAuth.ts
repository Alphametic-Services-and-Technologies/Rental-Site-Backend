import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import appDataSource from '../config/dataSource';
import { User } from '../entities/User';

interface CustomJwtPayload extends JwtPayload {
  id: string;
}

const verifyJwt = (
  token: string,
  secret: string
): Promise<string | JwtPayload | undefined> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
};

const isCustomJwtPayload = (
  decoded: JwtPayload
): decoded is CustomJwtPayload => {
  return 'id' in decoded;
};

const decodeJwtPayload = (decoded: string | JwtPayload | undefined) => {
  if (!decoded) return null;

  if (typeof decoded === 'string') {
    return decoded;
  }

  if (!isCustomJwtPayload(decoded)) return null;

  return decoded;
};

const checkAuth = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const userRepo = appDataSource.getRepository(User);
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in !', httpStatus.UNAUTHORIZED)
      );
    }

    const decoded = await verifyJwt(token, process.env.JWT_SECRET || '');

    const jwtPayload = decodeJwtPayload(decoded);

    if (!jwtPayload || typeof jwtPayload === 'string') {
      return next(
        new AppError('You are not logged in !', httpStatus.UNAUTHORIZED)
      );
    }

    const currentUser = await userRepo.findOneBy({ id: jwtPayload.id });

    if (!currentUser) {
      return next(
        new AppError('User no longer exists', httpStatus.BAD_REQUEST)
      );
    }

    if (!jwtPayload.iat) {
      return next(
        new AppError('You are not logged in !', httpStatus.UNAUTHORIZED)
      );
    }

    if (currentUser.changedPasswordAfter(jwtPayload.iat)) {
      return next(
        new AppError('User recently changed password', httpStatus.BAD_REQUEST)
      );
    }

    req.user = currentUser;

    return next();
  }
);

export default checkAuth;
