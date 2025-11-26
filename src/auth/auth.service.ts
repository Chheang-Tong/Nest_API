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
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly notifications: NotificationService,
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
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

    // 🔧 dev mode / OTP config
    const devMode = this.config.get<string>('OTP_DEV_MODE') === 'true';
    const disableExpire =
      this.config.get<string>('OTP_DISABLE_EXPIRE') === 'true';
    const defaultMinutes = Number(
      this.config.get<string>('OTP_EXPIRE_MINUTES') ?? '5',
    );

    // 1) decide OTP value
    const devOtpCode = this.config.get<string>('OTP_DEV_CODE');
    const otp =
      devMode && devOtpCode && devOtpCode.length > 0
        ? devOtpCode
        : this.generateOtp();

    // 2) expiry
    const expireMinutes = disableExpire ? 60 * 24 * 365 * 10 : defaultMinutes;
    const expires = new Date(Date.now() + expireMinutes * 60 * 1000);

    if (disableExpire) {
      console.warn(
        '[AuthService] OTP expiry is DISABLED (development mode). OTP will not expire.',
      );
    }

    if (devMode) {
      console.warn(
        `[AuthService] OTP DEV MODE is ON. Using fixed OTP: ${otp}, not sending email/SMS.`,
      );
    }

    user.otpCode = otp;
    user.otpExpiresAt = expires;
    await this.usersService.saveUser(user);

    // 3) send notification ONLY if not dev mode
    if (!devMode) {
      if (isEmail) {
        if (!user.email) {
          throw new BadRequestException(
            'No email associated with this account to send OTP.',
          );
        }
        void this.notifications.sendOtpEmail(user.email, user.name, otp);
      } else {
        if (!user.phoneNumber) {
          throw new BadRequestException(
            'No phone number associated with this account to send OTP.',
          );
        }
        void this.notifications.sendOtpSms(user.phoneNumber, user.name, otp);
      }
    }

    // 4) in dev mode, you can return OTP so you see it in Postman
    return {
      message: 'OTP has been generated. Please verify to complete login.',
      channel: devMode ? 'dev' : isEmail ? 'email' : 'sms',
      ...(devMode ? { otp } : {}), // only include OTP in response in dev mode
    };
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
