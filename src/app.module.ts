import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/entities/user.entities';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from './notification/notification.module';
import { ProductModule } from './product/product.module';
import { Product } from './product/entities';
import { CartModule } from './cart/cart.module';
import { CartItem } from './cart/entities';
import { SellModule } from './sell/sell.module';
import { Sell } from './sell/entities';
import { PromotionModule } from './promotion/promotion.module';
import { Promotion } from './promotion/entities';
import { ReportsModule } from './reports/reports.module';

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
})
export class AppModule {}
