import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  Request
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import {RolesGuard} from "../auth/guards/roles.guard";
import {Roles} from "../auth/roles.decorator";
import {UserRole} from "./entities/user.entity";

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Создайте нового пользователя' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Пользователь успешно создан.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверные входные данные.' })
  async create(@Body() createUserDto: CreateUserDto,) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить доступ ко всем пользователям' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список всех пользователей.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав для просмотра.' })
  async findAll( @Request() req: any) {
    return this.usersService.findAll(req.user);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Поиск пользователя по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор пользователя для получения данных', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Сведения о пользователе.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Пользователь не найден.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав для просмотра.' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.usersService.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE) // Remove MANAGER
  @ApiOperation({ summary: 'Обновить пользователя по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор пользователя для обновления', type: String })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Пользователь успешно обновлен.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Пользователь не найден.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверные входные данные.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав для обновления.' })
  async update(
      @Param('id') id: string,
      @Body() updateUserDto: UpdateUserDto,
      @Request() req: any,
  ) {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Удаление пользователя по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор пользователя для удаления', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Пользователь успешно удалён.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Пользователь не найден.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав для удаления.' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.usersService.remove(id, req.user);
  }
}