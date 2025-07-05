import {Injectable, Logger, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {CreateTestDriveDto} from './dto/create-test-drive.dto';
import {UpdateTestDriveDto} from './dto/update-test-drive.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {TestDrives} from "./entities/test-drive.entity";
import {Repository} from "typeorm";
import {Cars} from "../cars/entities/car.entity";
import {UserRole, Users} from "../users/entities/user.entity";

@Injectable()
export class TestDrivesService {
  private readonly logger = new Logger(TestDrivesService.name);

  constructor(
      @InjectRepository(TestDrives)
      private testDrivesRepository: Repository<TestDrives>,
      @InjectRepository(Cars)
      private carsRepository: Repository<Cars>,
      @InjectRepository(Users)
      private usersRepository: Repository<Users>,
  ) {}

  async create(createTestDriveDto: CreateTestDriveDto, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} создает тест-драйв`);

    const car = await this.carsRepository.findOne({ where: { id: createTestDriveDto.car_id } })
    if(!car) {
      throw new NotFoundException(`Автомобиль с id ${createTestDriveDto.car_id} не найден`);
    }

    const user = await this.usersRepository.findOne({ where: { id: currentUser.id } })
    if(!user) {
      throw new NotFoundException(`Пользователь с id ${currentUser.id} не найден`);
    }

    const testDrive = this.testDrivesRepository.create({...createTestDriveDto});

    return this.testDrivesRepository.save(testDrive);

  }

  findAll(currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} загружает все тест-драйвы`);

    // Определяем, какие тест-драйвы может видеть пользователь
    const allowedToView = {
      [UserRole.MANAGER]: {}, // Менеджер видит все
      [UserRole.EMPLOYEE]: { employee: { id: currentUser.id } }, // Сотрудник видит свои тест-драйвы
      [UserRole.CUSTOMER]: { customer: { id: currentUser.id } }, // Клиент видит свои тест-драйвы
    };

    const where = allowedToView[currentUser.role] ?? {};
    return this.testDrivesRepository.find({
      where,
      relations: ['car', 'customer', 'employee'],
      select: {
        id: true,
        scheduled_at: true,
        status: true,
        car: { id: true, model: true },
        customer: { id: true, name: true, email: true },
        employee: { id: true, name: true, email: true },
      },
    });
  }

  findOne(id: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} загружает тест-драйв ${id}`);
    const testDrive = this.testDrivesRepository.findOne({
      where: {id} ,
      relations: ['car', 'customer', 'employee'],
      select: {
        id: true,
        scheduled_at: true,
        status: true,
        car: { id: true, model: true },
        customer: { id: true, name: true, email: true },
        employee: { id: true, name: true, email: true },
      },
    })
    if(!testDrive){
      throw new NotFoundException(`Тест-драйв с id ${id} не найден`);
    }

    // Проверка доступа
    if (currentUser.role === UserRole.CUSTOMER && currentUser.id !== id) {
      throw new UnauthorizedException('Клиенты могут просматривать только свои тест-драйвы');
    }
    return testDrive;
  }

  async findByCustomer(customerId: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} загружает тест-драйвы для клиента ${customerId}`);
    // Проверка: менеджер или сам клиент
    if (currentUser.role !== UserRole.MANAGER && currentUser.id !== customerId) {
      throw new UnauthorizedException(
          'Только менеджер или сам клиент могут просматривать историю тест-драйвов клиента',
      );
    }

    return this.testDrivesRepository.find({
      where: { customer: { id: customerId } },
      relations: ['car', 'customer', 'employee'],
      select: {
        id: true,
        scheduled_at: true,
        status: true,
        car: { id: true, model: true },
        customer: { id: true, name: true, email: true },
        employee: { id: true, name: true, email: true },
      },
    });
  }

  async findByCar(carId: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} загружает тест-драйвы для автомобиля ${carId}`);
    // Проверка: только менеджер или сотрудник
    if (![UserRole.MANAGER, UserRole.EMPLOYEE].includes(currentUser.role)) {
      throw new UnauthorizedException(
          'Только менеджеры и сотрудники могут просматривать историю тест-драйвов автомобиля',
      );
    }

    return this.testDrivesRepository.find({
      where: { car: { id: carId } },
      relations: ['car', 'customer', 'employee'],
      select: {
        id: true,
        scheduled_at: true,
        status: true,
        car: { id: true, model: true },
        customer: { id: true, name: true, email: true },
        employee: { id: true, name: true, email: true },
      },
    });
  }

  async update(id: string, updateTestDriveDto: UpdateTestDriveDto, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} обновляет тест-драйв ${id}`);
    const testDrive = await this.testDrivesRepository
        .findOneOrFail({ where: { id }, relations: ['customer', 'employee'] })
        .catch(() => {
          throw new NotFoundException(`Тест-драйв с id ${id} не найден`);
        });

    // Проверка прав на обновление
    if (currentUser.role === UserRole.CUSTOMER && testDrive.customer.id !== currentUser.id) {
      throw new UnauthorizedException('Клиенты могут обновлять только свои тест-драйвы');
    }

    // Обновление сотрудника, если указано
    let employee: Users | null = testDrive.employee;
    if (updateTestDriveDto.employee_id) {
      if (currentUser.role !== UserRole.MANAGER) {
        throw new UnauthorizedException('Только менеджер может изменять сотрудника');
      }
      employee = await this.usersRepository
          .findOneOrFail({ where: { id: updateTestDriveDto.employee_id, role: UserRole.EMPLOYEE } })
          .catch(() => {
            throw new NotFoundException(
                `Сотрудник с id ${updateTestDriveDto.employee_id} не найден или не является сотрудником`,
            );
          });
    }

    // Обновление статуса или времени
    const updatedTestDrive = Object.assign(testDrive, {
      employee,
      status: updateTestDriveDto.status || testDrive.status,
      scheduled_at: updateTestDriveDto.scheduled_at
          ? new Date(updateTestDriveDto.scheduled_at)
          : testDrive.scheduled_at,
    });

    return this.testDrivesRepository.save(updatedTestDrive);
  }

  async remove(id: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} удаляет тест-драйв ${id}`);
    const testDrive = await this.testDrivesRepository
        .findOneOrFail({ where: { id }, relations: ['customer', 'employee'] })
        .catch(() => {
          throw new NotFoundException(`Тест-драйв с id ${id} не найден`);
        });

    // Проверка прав на удаление
    if (currentUser.role === UserRole.CUSTOMER && testDrive.customer.id !== currentUser.id) {
      throw new UnauthorizedException('Клиенты могут удалять только свои тест-драйвы');
    }

    await this.testDrivesRepository.delete(id);
    return { message: `Тест-драйв с id ${id} успешно удалён` };
  }
}
