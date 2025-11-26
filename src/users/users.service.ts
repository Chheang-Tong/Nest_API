import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entities';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../auth/enum';

@Injectable()
export class UsersService {
  userRepository: any;
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  findByPhone(phoneNumber: string) {
    return this.usersRepo.findOne({ where: { phoneNumber } });
  }

  findById(id: number) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async createUser(
    email: string | null,
    phoneNumber: string | null,
    hash: string,
    name: string,
  ): Promise<User> {
    const user = this.usersRepo.create({
      email,
      phoneNumber,
      passwordHash: hash,
      name,
    });
    return this.usersRepo.save(user);
  }

  // 🔹 For profile updates (current logged-in user)
  async updateOwnProfile(
    userId: number,
    dto: UpdateUserDto,
  ): Promise<Partial<User>> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email !== undefined) user.email = dto.email;
    if (dto.phoneNumber !== undefined) user.phoneNumber = dto.phoneNumber;
    if (dto.name !== undefined) user.name = dto.name;

    const saved = await this.usersRepo.save(user);
    return {
      id: saved.id,
      email: saved.email,
      phoneNumber: saved.phoneNumber,
      name: saved.name,
      createdAt: saved.createdAt,
    };
  }

  // 🔹 For admin: update *other* user by id
  async updateUserById(id: number, dto: UpdateUserDto): Promise<Partial<User>> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email !== undefined) user.email = dto.email;
    if (dto.phoneNumber !== undefined) user.phoneNumber = dto.phoneNumber;
    if (dto.name !== undefined) user.name = dto.name;

    const saved = await this.usersRepo.save(user);
    return {
      id: saved.id,
      email: saved.email,
      phoneNumber: saved.phoneNumber,
      name: saved.name,
      createdAt: saved.createdAt,
    };
  }

  // 🔹 internal updates (OTP etc.)
  async saveUser(user: User): Promise<User> {
    return this.usersRepo.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepo.find({
      select: ['id', 'email', 'phoneNumber', 'name', 'createdAt', 'role'],
    });
  }
  //Delete user by id
  async deleteUser(id: number): Promise<{ message: string }> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepo.remove(user);
    return { message: 'User deleted successfully' };
  }
  async deleteUsers(id: number): Promise<{ message: string }> {
    const result = await this.usersRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }

  async clearOtp(user: User): Promise<User> {
    user.otpCode = null;
    user.otpExpiresAt = null;
    return this.usersRepo.save(user);
  }
  async updateRole(id: number, role: Role) {
    const user = await this.usersRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role;
    return this.usersRepo.save(user);
  }
}
