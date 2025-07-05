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
import { InsuranceService } from './insurance.service';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { UpdateInsuranceDto } from './dto/update-insurance.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import {RolesGuard} from "../auth/guards/roles.guard";

@ApiTags('insurance')
@Controller('insurance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Создать новую страховку' })
  @ApiBody({ type: CreateInsuranceDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Страховка успешно создана.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверные входные данные.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async create(@Body() createInsuranceDto: CreateInsuranceDto, @Request() req: any) {
    return this.insuranceService.create(createInsuranceDto, req.user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить список всех страховок' })
  @ApiQuery({ name: 'status', enum: ['active', 'expired'], required: false, description: 'Фильтр по статусу страховки' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список страховок.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findAll(@Request() req: any, @Query('status') status?: 'active' | 'expired') {
    return this.insuranceService.findAll(req.user, status);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить страховку по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор страховки', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Сведения о страховке.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Страховка не найдена.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.insuranceService.findOne(id, req.user);
  }

  @Get('sale/:saleId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить страховку по продаже' })
  @ApiParam({ name: 'saleId', description: 'Идентификатор продажи', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Сведения о страховке для продажи.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Продажа или страховка не найдены.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findBySale(@Param('saleId') saleId: string, @Request() req: any) {
    return this.insuranceService.findBySale(saleId, req.user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Обновить страховку по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор страховки', type: String })
  @ApiBody({ type: UpdateInsuranceDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Страховка успешно обновлена.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Страховка не найдена.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверные входные данные.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async update(@Param('id') id: string, @Body() updateInsuranceDto: UpdateInsuranceDto, @Request() req: any) {
    return this.insuranceService.update(id, updateInsuranceDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Удалить страховку по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор страховки', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Страховка успешно удалена.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Страховка не найдена.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.insuranceService.remove(id, req.user);
  }
}