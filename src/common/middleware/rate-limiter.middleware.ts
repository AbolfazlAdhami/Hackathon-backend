import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private ipMap = new Map<string, { count: number; lastReset: number }>();
  private limit = 20; // 20 requests
  private windowMs = 60 * 1000; // per minute

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let record = this.ipMap.get(ip);
    if (!record || now - record.lastReset > this.windowMs) {
      record = { count: 1, lastReset: now };
      this.ipMap.set(ip, record);
    } else {
      record.count++;
      if (record.count > this.limit) {
        throw new HttpException(
          'Too many requests, please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }
    next();
  }
}
