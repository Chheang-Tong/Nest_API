// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class AuthService {}
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createUser(dto.email, hash, dto.name);

    return this.signToken(user.id, user.email, user.name);
  }

  async signin(dto: SigninDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signToken(user.id, user.email, user.name);
  }

  private signToken(userId: number, email: string, name: string) {
    const payload = { sub: userId, email, name };
    const accessToken = this.jwt.sign(payload);
    return {
      accessToken,
      user: { id: userId, email, name },
    };
  }
}
