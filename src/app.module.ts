import { Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ArcjetGuard, ArcjetModule, fixedWindow, shield } from '@arcjet/nest';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ArcjetModule.forRoot({
      isGlobal: true,
      key: process.env.ARCJET_KEY!,
      rules: [
        shield({ mode: 'LIVE' }),
        fixedWindow({
          mode: 'DRY_RUN',
          window: '60s',
          max: 100,
        }),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ArcjetGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure() {}
}
