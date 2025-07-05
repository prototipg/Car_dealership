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
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import {RolesGuard} from "../auth/guards/roles.guard";

@ApiTags('sales')
@Controller('sales')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Создать новую продажу' })
  @ApiBody({ type: CreateSaleDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Продажа успешно создана.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверные входные данные.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async create(@Body() createSaleDto: CreateSaleDto, @Request() req: any) {
    return this.salesService.create(createSaleDto, req.user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить список всех продаж' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список продаж.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findAll(@Request() req: any) {
    return this.salesService.findAll(req.user);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить продажу по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор продажи', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Сведения о продаже.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Продажа не найдена.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.salesService.findOne(id, req.user);
  }

  @Get('customer/:customerId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить историю покупок клиента' })
  @ApiParam({ name: 'customerId', description: 'Идентификатор клиента', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'История покупок клиента.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Клиент не найден.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findByCustomer(@Param('customerId') customerId: string, @Request() req: any) {
    return this.salesService.findByCustomer(customerId, req.user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Обновить продажу по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор продажи', type: String })
  @ApiBody({ type: UpdateSaleDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Продажа успешно обновлена.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Продажа не найдена.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверные входные данные.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto, @Request() req: any) {
    return this.salesService.update(id, updateSaleDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Удалить продажу по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор продажи', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Продажа успешно удалена.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Продажа не найдена.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.salesService.remove(id, req.user);
  }
}