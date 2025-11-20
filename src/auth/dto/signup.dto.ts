/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message: 'phoneNumber must be in E.164 format, e.g. +85598214986',
  })
  phoneNumber?: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  name!: string;
}
