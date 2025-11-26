import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorator';
import { Role } from '../auth/enum';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/all  (admin-ish; still protected by JWT)
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @UseGuards(JwtAuthGuard)
  @Get('all')
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  // GET /users/me
  @ApiOperation({ summary: 'Get own user profile' })
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
  @ApiOperation({ summary: 'Update own user profile' })
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@GetUser('id') userId: number, @Body() dto: UpdateUserDto) {
    return this.usersService.updateOwnProfile(userId, dto);
  }
  // Admin routes to manage users by ID
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateUserById(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUserById(id, dto);
  }

  @ApiOperation({ summary: 'Delete user by ID (admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
