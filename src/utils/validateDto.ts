import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';

export enum ValidationScope {
  Query = 'Query',
  Body = 'Body',
}

const validateDto = (
  dtoClass: any,
  scope: ValidationScope = ValidationScope.Body
) => {
  return async (
    req: Request<unknown, unknown, unknown, unknown>,
    res: Response,
    next: NextFunction
  ) => {
    const dtoObject: any = plainToInstance(
      dtoClass,
      scope === ValidationScope.Body ? req.body : req.query
    );

    const errors = await validate(dtoObject);

    if (errors.length > 0) {
      const formattedErrors: Record<string, string[]> = {};

      errors.forEach((error) => {
        if (error.constraints) {
          formattedErrors[error.property] = Object.values(error.constraints);
        }
      });

      res.status(httpStatus.BAD_REQUEST).json({
        message: 'Invalid request',
        errors: formattedErrors,
      });
    } else {
      if (scope === ValidationScope.Body) req.body = dtoObject as any;
      else req.query = dtoObject as any;

      next();
    }
  };
};

export default validateDto;
