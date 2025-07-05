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
  Request,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import {RolesGuard} from "../auth/guards/roles.guard";

@ApiTags('services')
@Controller('services')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Создать новую запись о сервисе' })
  @ApiBody({ type: CreateServiceDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Сервис успешно создан.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверные входные данные.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async create(@Body() createServiceDto: CreateServiceDto, @Request() req: any) {
    return this.servicesService.create(createServiceDto, req.user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить список всех сервисов' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список сервисов.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findAll(@Request() req: any) {
    return this.servicesService.findAll(req.user);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить сервис по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор сервиса', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Сведения о сервисе.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Сервис не найден.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.servicesService.findOne(id, req.user);
  }

  @Get('car/:carId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить историю сервисов автомобиля' })
  @ApiParam({ name: 'carId', description: 'Идентификатор автомобиля', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'История сервисов автомобиля.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Автомобиль не найден.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findByCar(@Param('carId') carId: string, @Request() req: any) {
    return this.servicesService.findByCar(carId, req.user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Обновить сервис по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор сервиса', type: String })
  @ApiBody({ type: UpdateServiceDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Сервис успешно обновлен.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Сервис не найден.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверные входные данные.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto, @Request() req: any) {
    return this.servicesService.update(id, updateServiceDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Удалить сервис по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор сервиса', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Сервис успешно удалён.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Сервис не найден.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.servicesService.remove(id, req.user);
  }
}