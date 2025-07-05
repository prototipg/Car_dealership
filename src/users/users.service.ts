import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import * as bcrypt from 'bcrypt';
import {UserRole, Users} from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import {UpdateUserDto} from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new BadRequestException(`Пользователь с email ${createUserDto.email} уже существует`);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findAll(currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} получает список всех пользователей`);

    if (currentUser.role !== UserRole.MANAGER) {
      throw new UnauthorizedException(
        `Пользователь с ролью '${currentUser.role}' не может просматривать всех пользователей`,
      );
    }

    return this.usersRepository.find({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  async findOne(id: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} получает список всех пользователей ${id}`);

    if (currentUser.role !== UserRole.MANAGER && currentUser.id !== id) {
      throw new UnauthorizedException(
        `Пользователь с ролью '${currentUser.role}' не может просматривать данные других пользователей`,
      );
    }

    const user = await this.usersRepository
      .findOneOrFail({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      })
      .catch(() => {
        throw new NotFoundException(`Пользователь с id ${id} не найден`);
      });

    return user;
  }

  async findById(id: string) {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findOneBy({ email })
    if (!user) {
      throw new NotFoundException(`Пользователь с email ${email} не найдено`)
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} обновляет профиль пользователя ${id}`);

    if (currentUser.role !== UserRole.MANAGER && currentUser.id !== id) {
      throw new UnauthorizedException(
        `Пользователь с ролью '${currentUser.role}' не может обновлять данные других пользователей`,
      );
    }

    const user = await this.usersRepository
      .findOneOrFail({ where: { id } })
      .catch(() => {
        throw new NotFoundException(`Пользователь с id ${id} не найден`);
      });

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({ where: { email: updateUserDto.email } });
      if (existingUser) {
        throw new BadRequestException(`Пользователь с email ${updateUserDto.email} уже существует`);
      }
    }

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    user.name = updateUserDto.name ?? user.name;
    user.email = updateUserDto.email ?? user.email;
    user.role = updateUserDto.role ?? user.role;

    return this.usersRepository.save(user);
  }

  async remove(id: string, currentUser: Users) {
    this.logger.log(`Пользователь с id ${currentUser.id}  удаляет пользователя ${id}`);

    if (currentUser.role !== UserRole.MANAGER) {
      throw new UnauthorizedException(
        `Пользователь с ролью '${currentUser.role}' не может удалять пользователей`,
      );
    }

    const user = await this.usersRepository.findOne({ where: { id } });
    if(!user) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }

    await this.usersRepository.delete(id);
    return { message: `Пользователь с id ${id} успешно удалён` };
  }
}
