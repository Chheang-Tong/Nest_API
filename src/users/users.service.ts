// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class UsersService {}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(id: number) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async createUser(email: string, hash: string, name: string) {
    const user = this.usersRepo.create({
      email,
      passwordHash: hash,
      name,
    });
    return this.usersRepo.save(user);
  }
}
