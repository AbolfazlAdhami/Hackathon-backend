import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

const AllowAnonymous = async (...args: any[]) => {
  const { AllowAnonymous } = await import('@thallesp/nestjs-better-auth');
  return AllowAnonymous(...args);
};

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @AllowAnonymous()
  getHello(): string {
    return this.appService.getHello();
  }
}
