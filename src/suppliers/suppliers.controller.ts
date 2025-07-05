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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import {RolesGuard} from "../auth/guards/roles.guard";

@ApiTags('suppliers')
@Controller('suppliers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Создать новую запись о поставке' })
  @ApiBody({ type: CreateSupplierDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Поставка успешно создана.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверные входные данные.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async create(@Body() createSupplierDto: CreateSupplierDto, @Request() req: any) {
    return this.suppliersService.create(createSupplierDto, req.user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить список всех поставок' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список поставок.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findAll(@Request() req: any) {
    return this.suppliersService.findAll(req.user);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить поставку по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор поставки', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Сведения о поставке.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Поставка не найдена.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.suppliersService.findOne(id, req.user);
  }

  @Get('car/:carId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить историю поставок автомобиля' })
  @ApiParam({ name: 'carId', description: 'Идентификатор автомобиля', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'История поставок автомобиля.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Автомобиль не найден.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findByCar(@Param('carId') carId: string, @Request() req: any) {
    return this.suppliersService.findByCar(carId, req.user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Обновить поставку по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор поставки', type: String })
  @ApiBody({ type: UpdateSupplierDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Поставка успешно обновлена.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Поставка не найдена.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверные входные данные.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto, @Request() req: any) {
    return this.suppliersService.update(id, updateSupplierDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Удалить поставку по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор поставки', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Поставка успешно удалена.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Поставка не найдена.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.suppliersService.remove(id, req.user);
  }
}