import { Controller, Post, Body, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './roles.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {UserRole} from "../users/entities/user.entity";

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @ApiOperation({ summary: 'Вход пользователя' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: HttpStatus.OK, description: 'Успешный вход, возвращает JWT-токен.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Неверные учетные данные.' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('register')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.MANAGER)
    @ApiOperation({ summary: 'Регистрация нового пользователя (только для менеджеров)' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Пользователь успешно зарегистрирован.' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверные входные данные.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
    @ApiBearerAuth()
    async register(@Body() registerDto: RegisterDto, @Request() req: any) {
        return this.authService.register(registerDto, req.user);
    }
}