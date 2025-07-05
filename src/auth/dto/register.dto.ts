import { IsString, IsEmail, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {UserRole} from "../../users/entities/user.entity";

export class RegisterDto {
    @IsString()
    @ApiProperty({ example: 'Manager', description: 'Имя пользователя' })
    name: string;

    @IsEmail()
    @ApiProperty({ example: 'dbn53614@gmail.com', description: 'Email пользователя' })
    email: string;

    @IsString()
    @MinLength(6)
    @ApiProperty({ example: '123456789', description: 'Пароль пользователя (минимум 6 символов)' })
    password: string;

    @IsEnum(UserRole)
    @ApiProperty({ enum: UserRole, example: UserRole.MANAGER, description: 'Роль пользователя' })
    role: UserRole;
}