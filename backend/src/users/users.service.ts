import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserDto } from './user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from './role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.createDefaultAdminUser();
  }

  async createDefaultAdminUser(): Promise<void> {
    const adminUser = await this.usersRepository.findOne({
      where: { username: 'admin' },
    });
    if (!adminUser) {
      const admin: Partial<User> = {
        username: 'admin',
        password: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        role: Role.Admin,
      };
      await this.create(admin);
    }
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.usersRepository.find();
    return users.map((user) => this.toUserDto(user));
  }

  async findOne(username: string): Promise<UserDto | undefined> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user) {
      return this.toUserDto(user);
    }
    return undefined;
  }

  async findOneById(id: number): Promise<UserDto | undefined> {
    const user = await this.usersRepository.findOneBy({ id });
    if (user) {
      return this.toUserDto(user);
    }
    return undefined;
  }

  async create(user: Partial<User>): Promise<UserDto> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const found = await this.findOne(user.username);

    if (found) {
      throw new BadRequestException('Username already exists');
    }

    const newUser = this.usersRepository.create({
      ...user,
      password: hashedPassword,
    });
    const savedUser = await this.usersRepository.save(newUser);
    return this.toUserDto(savedUser);
  }

  async update(id: number, user: Partial<User>): Promise<UserDto> {
    await this.usersRepository.update(id, user);
    const updatedUser = await this.usersRepository.findOneBy({ id });
    if (updatedUser) {
      return this.toUserDto(updatedUser);
    }
    return undefined;
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  public toUserDto(user: User): UserDto {
    const { id, username, role, firstName, lastName } = user;
    return { id, username, role, firstName, lastName };
  }
}
