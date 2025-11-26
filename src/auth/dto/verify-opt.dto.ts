import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'User identifier (email or phone number)',
    example: 'test@example.com", or "+85598******',
  })
  @IsString()
  identifier!: string;

  @ApiProperty({
    description: 'One-Time Password (OTP) code (6 digits)',
    example: '123456',
    minLength: 6,
  })
  @IsString()
  @Length(6, 6, { message: 'otp must be 6 digits' })
  otp!: string;
}
