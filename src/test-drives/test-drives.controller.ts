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
import { TestDrivesService } from './test-drives.service';
import { CreateTestDriveDto } from './dto/create-test-drive.dto';
import { UpdateTestDriveDto } from './dto/update-test-drive.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('test-drives')
@Controller('test-drives')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TestDrivesController {
  constructor(private readonly testDrivesService: TestDrivesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Создать новый тест-драйв' })
  @ApiBody({ type: CreateTestDriveDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Тест-драйв успешно создан.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверные входные данные.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async create(@Body() createTestDriveDto: CreateTestDriveDto, @Request() req: any) {
    return this.testDrivesService.create(createTestDriveDto, req.user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить список всех тест-драйвов' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список тест-драйвов.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findAll(@Request() req: any) {
    return this.testDrivesService.findAll(req.user);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить тест-драйв по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор тест-драйва', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Сведения о тест-драйве.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Тест-драйв не найден.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.testDrivesService.findOne(id, req.user);
  }

  @Get('customer/:customerId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить историю тест-драйвов клиента' })
  @ApiParam({ name: 'customerId', description: 'Идентификатор клиента', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'История тест-драйвов клиента.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Клиент не найден.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findByCustomer(@Param('customerId') customerId: string, @Request() req: any) {
    return this.testDrivesService.findByCustomer(customerId, req.user);
  }

  @Get('car/:carId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить историю тест-драйвов автомобиля' })
  @ApiParam({ name: 'carId', description: 'Идентификатор автомобиля', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'История тест-драйвов автомобиля.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Автомобиль не найден.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async findByCar(@Param('carId') carId: string, @Request() req: any) {
    return this.testDrivesService.findByCar(carId, req.user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Обновить тест-драйв по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор тест-драйва', type: String })
  @ApiBody({ type: UpdateTestDriveDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Тест-драйв успешно обновлен.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Тест-драйв не найден.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверные входные данные.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async update(@Param('id') id: string, @Body() updateTestDriveDto: UpdateTestDriveDto, @Request() req: any) {
    return this.testDrivesService.update(id, updateTestDriveDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.MANAGER)
  @ApiOperation({ summary: 'Удалить тест-драйв по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор тест-драйва', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Тест-драйв успешно удалён.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Тест-драйв не найден.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Недостаточно прав.' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.testDrivesService.remove(id, req.user);
  }
}