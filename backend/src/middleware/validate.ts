import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import logger from '../config/logger';

interface ValidationErrorResponse {
  errors: {
    [key: string]: string;
  };
}

export const validate = (req: Request, res: Response, next: NextFunction): void | Response => {
  const errors = validationResult(req);
  
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors: ValidationErrorResponse = {
    errors: {}
  };

  errors.array().forEach((err: ValidationError) => {
    if (err.type === 'field') {
      extractedErrors.errors[err.path] = err.msg;
    }
  });

  logger.warn('Validation error:', extractedErrors);
  
  return res.status(422).json(extractedErrors);
}; 