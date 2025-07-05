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
  Query,
} from '@nestjs/common';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CarStatus } from './entities/car.entity';
import { RolesGuard } from "../auth/guards/roles.guard";

@ApiTags('cars')
@Controller('cars')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Создать новый автомобиль' })
  @ApiBody({ type: CreateCarDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Автомобиль успешно создан.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверные входные данные.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async create(@Body() createCarDto: CreateCarDto, @Request() req:any) {
    return this.carsService.create(createCarDto, req.user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить список автомобилей' })
  @ApiQuery({ name: 'model', required: false, description: 'Фильтр по модели' })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Фильтр по году выпуска' })
  @ApiQuery({ name: 'color', required: false, description: 'Фильтр по цвету' })
  @ApiQuery({ name: 'status', required: false, enum: CarStatus, description: 'Фильтр по статусу' })
  @ApiQuery({ name: 'sortField', required: false, description: 'Поле для сортировки (model, year, price, mileage, color, status)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Порядок сортировки' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество записей на странице' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список автомобилей.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findAll(
      @Request() req: any,
      @Query('model') model: string,
      @Query('year') year: string,
      @Query('color') color: string,
      @Query('status') status: CarStatus,
      @Query('sortField') sortField: string,
      @Query('sortOrder') sortOrder: 'ASC' | 'DESC',
      @Query('page') page: string = '1',
      @Query('limit') limit: string = '10',
  ) {
    const filters = { model, year: year ? parseInt(year) : undefined, color, status };
    const sort = { field: sortField, order: sortOrder };
    return this.carsService.findAll(req.user, filters, sort, parseInt(page), parseInt(limit));
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить автомобиль по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор автомобиля', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Сведения об автомобиле.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Автомобиль не найден.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.carsService.findOne(id, req.user);
  }

  @Get(':id/sales')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить историю продаж автомобиля' })
  @ApiParam({ name: 'id', description: 'Идентификатор автомобиля', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'История продаж автомобиля.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Автомобиль не найден.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findSalesHistory(@Param('id') id: string, @Request() req: any) {
    return this.carsService.findSalesHistory(id, req.user);
  }

  @Get(':id/services')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить историю сервисов автомобиля' })
  @ApiParam({ name: 'id', description: 'Идентификатор автомобиля', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'История сервисов автомобиля.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Автомобиль не найден.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findServicesHistory(@Param('id') id: string, @Request() req: any) {
    return this.carsService.findServicesHistory(id, req.user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Обновить автомобиль по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор автомобиля', type: String })
  @ApiBody({ type: UpdateCarDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Автомобиль успешно обновлен.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Автомобиль не найден.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверные входные данные.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async update(@Param('id') id: string, @Body() updateCarDto: UpdateCarDto, @Request() req: any) {
    return this.carsService.update(id, updateCarDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Удалить автомобиль по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор автомобиля', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Автомобиль успешно удалён.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Автомобиль не найден.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Автомобиль участвует в связях.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.carsService.remove(id, req.user);
  }
}