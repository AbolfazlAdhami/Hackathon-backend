import { Controller, All, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../lib/auth';

@Controller('api/auth')
export class AuthController {
  @All('*')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    return toNodeHandler(auth.handler)(req, res);
  }
}
