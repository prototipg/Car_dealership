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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import {RolesGuard} from "../auth/guards/roles.guard";

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Создать новый платеж' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Платеж успешно создан.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверные входные данные.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async create(@Body() createPaymentDto: CreatePaymentDto, @Request() req: any) {
    return this.paymentsService.create(createPaymentDto, req.user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить список всех платежей' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список платежей.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findAll(@Request() req: any) {
    return this.paymentsService.findAll(req.user);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить платеж по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор платежа', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Сведения о платеже.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Платеж не найден.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.paymentsService.findOne(id, req.user);
  }

  @Get('sale/:saleId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить платежи по продаже' })
  @ApiParam({ name: 'saleId', description: 'Идентификатор продажи', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список платежей по продаже.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Продажа не найдена.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findBySale(@Param('saleId') saleId: string, @Request() req: any) {
    return this.paymentsService.findBySale(saleId, req.user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Обновить платеж по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор платежа', type: String })
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Платеж успешно обновлен.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Платеж не найден.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверные входные данные.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto, @Request() req: any) {
    return this.paymentsService.update(id, updatePaymentDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Удалить платеж по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор платежа', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Платеж успешно удалён.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Платеж не найден.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.paymentsService.remove(id, req.user);
  }
}