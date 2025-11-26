/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { User } from './users/entities/user.entities';
import { Product } from './product/entities';
import { CartItem } from './cart/entities';
import { Sell } from './sell/entities';
import { Promotion } from './promotion/entities';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from './notification/notification.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { SellModule } from './sell/sell.module';
import { PromotionModule } from './promotion/promotion.module';
import { ReportsModule } from './reports/reports.module';
import { RequiredHeadersGuard, RolesGuard } from './auth/guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USER', 'devuser'),
        password: config.get<string>('DB_PASS', '123456'),
        database: config.get<string>('DB_NAME', 'nest_auth'),
        entities: [User, Product, CartItem, Sell, Promotion],
        synchronize: true,
      }),
    }),

    UsersModule,
    AuthModule,
    NotificationModule,
    ProductModule,
    CartModule,
    SellModule,
    PromotionModule,
    ReportsModule,
  ],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
    // ✅ ONLY global header guard
    {
      provide: APP_GUARD,
      useClass: RequiredHeadersGuard,
    },
    // ❌ DO NOT make RolesGuard global here
    // RolesGuard will be used on specific routes with @UseGuards
  ],
})
export class AppModule {}
