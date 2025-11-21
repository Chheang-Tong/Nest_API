import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { User } from '../users/entities/user.entities';
import { NotificationService } from '../notification/notification.service';
import { VerifyOtpDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly notifications: NotificationService,
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    if (!dto.email && !dto.phoneNumber) {
      throw new BadRequestException('Either email or phoneNumber is required');
    }

    if (dto.email) {
      const existingByEmail = await this.usersService.findByEmail(dto.email);
      if (existingByEmail) {
        throw new ConflictException('Email already in use');
      }
    }

    if (dto.phoneNumber) {
      const existingByPhone = await this.usersService.findByPhone(
        dto.phoneNumber,
      );
      if (existingByPhone) {
        throw new ConflictException('Phone number already in use');
      }
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.createUser(
      dto.email ?? null,
      dto.phoneNumber ?? null,
      hash,
      dto.name,
    );

    // optional: welcome email/SMS here

    // you asked OTP specifically for signin, so signup still returns token
    return this.signToken(user);
  }

  /**
   * Step 1: verify password and send OTP
   */
  async signin(dto: SigninDto) {
    const isEmail = dto.identifier.includes('@');

    const user = isEmail
      ? await this.usersService.findByEmail(dto.identifier)
      : await this.usersService.findByPhone(dto.identifier);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // generate 6-digit OTP
    const otp = this.generateOtp();

    // expiry = now + 5 minutes
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 5);

    user.otpCode = otp;
    user.otpExpiresAt = expires;
    await this.usersService.saveUser(user);
    // send OTP (email / SMS)
    if (user.email) {
      void this.notifications.sendOtpEmail(user.email, user.name, otp);
    }
    if (user.phoneNumber) {
      // if you have sendOtpSms implemented
      void this.notifications.sendOtpSms?.(user.phoneNumber, user.name, otp);
    }

    return { message: 'OTP has been sent. Please verify to complete login.' };
  }

  /**
   * Step 2: verify OTP and return JWT token
   */
  async verifyOtp(dto: VerifyOtpDto) {
    const isEmail = dto.identifier.includes('@');

    const user = isEmail
      ? await this.usersService.findByEmail(dto.identifier)
      : await this.usersService.findByPhone(dto.identifier);

    if (!user || !user.otpCode || !user.otpExpiresAt) {
      throw new UnauthorizedException('OTP invalid or not requested');
    }

    const now = new Date();

    if (user.otpCode !== dto.otp) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    if (user.otpExpiresAt.getTime() < now.getTime()) {
      throw new UnauthorizedException('OTP has expired');
    }

    // clear OTP after success
    await this.usersService.clearOtp(user);

    // now issue token
    return this.signToken(user);
  }

  private signToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      name: user.name,
    };

    const accessToken = this.jwt.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
      },
    };
  }

  private generateOtp(): string {
    // 6-digit numeric OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
