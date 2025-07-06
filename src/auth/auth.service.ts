import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Users, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async login(loginDto: LoginDto) {
        this.logger.log(`Попытка входа для email: ${loginDto.email}`);
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            this.logger.warn(`Пользователь с email ${loginDto.email} не найден`);
            throw new UnauthorizedException('Неверный email или пароль');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            this.logger.warn(`Неверный пароль для email: ${loginDto.email}`);
            throw new UnauthorizedException('Неверный email или пароль');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);
        this.logger.log(`Успешный вход для пользователя ${user.id}`);
        return { access_token: token };
    }

    async register(registerDto: RegisterDto, currentUser: Users) {
        this.logger.log(`Пользователь ${currentUser.id} пытается зарегистрировать нового пользователя: ${registerDto.email}`);

        if (currentUser.role !== UserRole.MANAGER) {
            this.logger.warn(`Пользователь ${currentUser.id} с ролью ${currentUser.role} пытался зарегистрировать пользователя`);
            throw new UnauthorizedException('Только менеджеры могут регистрировать новых пользователей');
        }

        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            this.logger.warn(`Email ${registerDto.email} уже зарегистрирован`);
            throw new BadRequestException('Email уже зарегистрирован');
        }


        this.logger.log(`Пользователь ${currentUser.id} успешно зарегистрирован`);
        return { message: 'Пользователь успешно зарегистрирован', userId: currentUser.id };
    }
}