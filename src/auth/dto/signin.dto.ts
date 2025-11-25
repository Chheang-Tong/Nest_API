import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SigninDto {
  @ApiProperty({
    description: 'User login identifier (email or username)',
    example: 'test@gmail.com',
  })
  @IsString()
  identifier!: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: '123456',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
