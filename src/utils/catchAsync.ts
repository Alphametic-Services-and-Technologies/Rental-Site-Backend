import { Request, Response, NextFunction } from 'express';

const catchAsync = <P = {}, ResBody = any, ReqBody = any, Query = any>(
  fn: (
    req: Request<P, ResBody, ReqBody, Query>,
    res: Response,
    next: NextFunction
  ) => Promise<any>
) => {
  return (
    req: Request<P, ResBody, ReqBody, Query>,
    res: Response,
    next: NextFunction
  ): void => {
    fn(req, res, next).catch((err) => next(err));
  };
};

export default catchAsync;
