import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../entities/User';
import AppError from '../utils/AppError';
import httpStatus from 'http-status';

const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!roles.includes(req.user!.role)) {
      return next(
        new AppError(
          "You don't have permission to access this resource",
          httpStatus.FORBIDDEN
        )
      );
    }

    next();
  };
};

export default restrictTo;
