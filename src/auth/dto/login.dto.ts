import { IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @IsEmail()
    @ApiProperty({ example: 'dbn53614@gmail.com', description: 'Email пользователя' })
    email: string;

    @IsString()
    @MinLength(6)
    @ApiProperty({ example: '123456789', description: 'Пароль пользователя (минимум 6 символов)' })
    password: string;
}