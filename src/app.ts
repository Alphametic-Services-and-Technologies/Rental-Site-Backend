import express from 'express';
import userRouter from './routes/user.route';
import AppError from './utils/AppError';
import httpStatus from 'http-status';
import errorController from './controllers/error.controller';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';

const app = express();

app.use(helmet());

app.use(morgan('combined'));

app.use(
  '/',
  rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests',
  })
);

app.use(express.json({ limit: '10kb' }));

app.use(
  '/images',
  express.static(path.join(process.cwd(), 'public/images/users'))
);

app.use('/users', userRouter);

app.all('*', (req, _res, next) => {
  next(
    new AppError(
      `Cant find ${req.originalUrl} on this server`,
      httpStatus.NOT_FOUND
    )
  );
});

app.use(errorController.globalErrorHandler);

export default app;
