import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/all  (admin-ish; still protected by JWT)
  @UseGuards(JwtAuthGuard)
  @Get('all')
  findAll() {
    return this.usersService.findAll();
  }

  // GET /users/me
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findMe(@GetUser('id') userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      name: user.name,
      createdAt: user.createdAt,
    };
  }

  // PATCH /users/me
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@GetUser('id') userId: number, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(userId, dto);
  }
}
