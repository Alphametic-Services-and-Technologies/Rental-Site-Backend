// src/types/express.d.ts
import { User } from '../entities/User'; // Adjust the import path for your User entity

export {};

declare module 'express-serve-static-core' {
  interface Request {
    user?: User | null;
  }
}
