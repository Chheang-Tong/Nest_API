import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entities';

@Injectable()
export class UsersService {
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

  async updateUser(user: User): Promise<User> {
    return this.usersRepo.save(user);
  }

  async clearOtp(user: User): Promise<User> {
    user.otpCode = null;
    user.otpExpiresAt = null;
    return this.usersRepo.save(user);
  }
}
