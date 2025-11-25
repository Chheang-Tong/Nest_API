/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { JwtAuthGuard } from './guard';
import { VerifyOtpDto } from './dto';
import { GetUser } from './decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ---------------------------------------------------
  // SIGNUP
  // ---------------------------------------------------
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({
    type: SignupDto,
    description: 'Signup payload',
  })
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  // ---------------------------------------------------
  // SIGNIN -> SEND OTP
  // ---------------------------------------------------
  @ApiOperation({ summary: 'Sign in with email/username and receive OTP' })
  @ApiBody({
    type: SigninDto,
    description: 'Signin payload to request OTP',
  })
  @Post('signin')
  signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }

  // ---------------------------------------------------
  // VERIFY OTP
  // ---------------------------------------------------
  @ApiOperation({ summary: 'Verify OTP and receive JWT token' })
  @ApiBody({
    type: VerifyOtpDto,
    description: 'Verify OTP payload',
  })
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  // ---------------------------------------------------
  // GET USER INFO
  // ---------------------------------------------------
  @ApiOperation({ summary: 'Get user profile' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@GetUser() user: any) {
    return user;
  }
}
