import { Request, Response, NextFunction } from 'express';
import pinoHttp from 'pino-http';
import { logger } from '../utils/logger';
import { randomUUID } from 'crypto';

export const requestLogger = pinoHttp({
  logger,
  genReqId: () => randomUUID(),
  serializers: {
    req: (req: Request) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
      },
      remoteAddress: req.ip,
    },
    res: (res: Response) => ({
      statusCode: res.statusCode,
      headers: {
        'content-type': res.getHeader('content-type'),
      },
    },
  },
  customLogLevel: (req: Request, res: Response, error: Error) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || error) {
      return 'error';
    }
    return 'info';
  },
  customSuccessMessage: (req: Request, res: Response) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req: Request, res: Response, error: Error) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${error.message}`;
  },
});

// Add request ID to response headers
export const addRequestId = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Request-ID', req.id);
  next();
};
