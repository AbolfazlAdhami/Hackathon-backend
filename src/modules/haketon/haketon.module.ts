import { Module } from '@nestjs/common';
import { HaketonController } from './haketon.controller';

@Module({
  controllers: [HaketonController],
})
export class HaketonModule {}
