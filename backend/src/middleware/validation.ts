import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { BadRequest } from '../utils/httpException';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errors = result.error.errors.reduce((acc, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        }, {} as Record<string, string>);
        
        throw new BadRequest('Validation failed', errors);
      }

      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};
