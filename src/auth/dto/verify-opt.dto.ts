/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  identifier!: string;

  @IsString()
  @Length(6, 6, { message: 'otp must be 6 digits' })
  otp!: string;
}
