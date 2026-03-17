import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from '@core/prisma.module';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { CacheModule } from '@modules/cache/cache.module';
import { HealthModule } from '@modules/health/health.module';
import { QrCodesModule } from '@modules/qr-codes/qr-codes.module';
import { GlobalAuthGuard } from '@guards/global-auth.guard';
import { RolesGuard } from '@guards/roles.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AnalyticsModule } from '@modules/analytics/analytics.module';
import { LoggerModule } from '@core/logger.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'global',
          ttl: 60 * 1000,
          limit: 100,
        },
        {
          name: 'auth',
          ttl: 15 * 60 * 1000,
          limit: 5,
        },
      ],
    }),
    PrismaModule,
    CacheModule,
    UsersModule,
    AuthModule,
    HealthModule,
    QrCodesModule,
    AnalyticsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: GlobalAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
