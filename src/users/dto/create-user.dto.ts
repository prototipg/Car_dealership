import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'To\liq ism',
    example: 'Manager',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'To\liq ism',
    example: 'dbn53614@gmail.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'To\liq ism',
    example: '+9989994563221',
    required: true,
  })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty({
    description: 'To\liq ism',
    example: '123456789',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'To\liq ism',
    example: 'manager',
    required: true,
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
