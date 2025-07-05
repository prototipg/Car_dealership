import { Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Services } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Users, UserRole } from '../users/entities/user.entity';
import { Cars } from '../cars/entities/car.entity';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(
      @InjectRepository(Services)
      private servicesRepository: Repository<Services>,
      @InjectRepository(Cars)
      private carsRepository: Repository<Cars>,
  ) {}

  async create(createServiceDto: CreateServiceDto, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} создаёт сервис`);

    // Проверка роли: только EMPLOYEE может создавать сервис
    if (currentUser.role !== UserRole.EMPLOYEE) {
      throw new UnauthorizedException(
          `Пользователь с ролью '${currentUser.role}' не может создавать запись о сервисе`,
      );
    }

    // Проверка автомобиля
    const car = await this.carsRepository
        .findOneOrFail({ where: { id: createServiceDto.car_id } })
        .catch(() => {
          throw new NotFoundException(`Автомобиль с id ${createServiceDto.car_id} не найден`);
        });

    // Проверка сотрудника (должен быть текущим пользователем)
    if (createServiceDto.employee_id && createServiceDto.employee_id !== currentUser.id) {
      throw new UnauthorizedException('Сотрудник может указать только себя для сервиса');
    }

    const service = this.servicesRepository.create({
      car,
      employee: currentUser,
      description: createServiceDto.description,
      service_date: createServiceDto.service_date ? new Date(createServiceDto.service_date) : new Date(),
      cost: createServiceDto.cost,
    });

    return this.servicesRepository.save(service);
  }

  async findAll(currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} запрашивает все сервисы`);

    // Определяем, какие сервисы может видеть пользователь
    const allowedToView = {
      [UserRole.MANAGER]: {}, // Менеджер видит все
      [UserRole.EMPLOYEE]: { employee: { id: currentUser.id } }, // Сотрудник видит свои сервисы
      [UserRole.CUSTOMER]: {}, // Клиенты не видят сервисы
    };

    if (currentUser.role === UserRole.CUSTOMER) {
      throw new UnauthorizedException('Клиенты не могут просматривать записи о сервисах');
    }

    const where = allowedToView[currentUser.role] ?? {};
    return this.servicesRepository.find({
      where,
      relations: ['car', 'employee'],
      select: {
        id: true,
        description: true,
        service_date: true,
        cost: true,
        car: { id: true, model: true },
        employee: { id: true, name: true, email: true },
      },
    });
  }

  async findOne(id: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} запрашивает услугу ${id}`);
    const service = await this.servicesRepository
        .findOneOrFail({
          where: { id },
          relations: ['car', 'employee'],
          select: {
            id: true,
            description: true,
            service_date: true,
            cost: true,
            car: { id: true, model: true },
            employee: { id: true, name: true, email: true },
          },
        })
        .catch(() => {
          throw new NotFoundException(`Сервис с id ${id} не найден`);
        });

    // Проверка доступа
    if (
        currentUser.role === UserRole.EMPLOYEE &&
        service.employee.id !== currentUser.id
    ) {
      throw new UnauthorizedException('Сотрудники могут просматривать только свои сервисы');
    }
    if (currentUser.role === UserRole.CUSTOMER) {
      throw new UnauthorizedException('Клиенты не могут просматривать записи о сервисах');
    }

    return service;
  }

  async findByCar(carId: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} запрашивает услуги для автомобиля ${carId}`);
    // Проверка роли: только MANAGER и EMPLOYEE
    if (![UserRole.MANAGER, UserRole.EMPLOYEE].includes(currentUser.role)) {
      throw new UnauthorizedException(
          'Только менеджеры и сотрудники могут просматривать историю сервисов автомобиля',
      );
    }

    const car = await this.carsRepository.findOne({ where: { id: carId } })
    if(!car) {
      throw new NotFoundException(`Автомобиль с id ${carId} не найден`);
    }

    return this.servicesRepository.find({
      where: { car: { id: carId } },
      relations: ['car', 'employee'],
      select: {
        id: true,
        description: true,
        service_date: true,
        cost: true,
        car: { id: true, model: true },
        employee: { id: true, name: true, email: true },
      },
    });
  }

  async update(id: string, updateServiceDto: UpdateServiceDto, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} обновляет сервис ${id}`);
    const service = await this.servicesRepository
        .findOneOrFail({ where: { id }, relations: ['employee'] })
        .catch(() => {
          throw new NotFoundException(`Сервис с id ${id} не найден`);
        });

    // Проверка роли: только MANAGER или сотрудник, создавший сервис
    if (
        currentUser.role !== UserRole.MANAGER &&
        (currentUser.role !== UserRole.EMPLOYEE || service.employee.id !== currentUser.id)
    ) {
      throw new UnauthorizedException(
          `Пользователь с ролью '${currentUser.role}' не может обновлять этот сервис`,
      );
    }

    const updatedService = Object.assign(service, {
      description: updateServiceDto.description ?? service.description,
      service_date: updateServiceDto.service_date
          ? new Date(updateServiceDto.service_date)
          : service.service_date,
      cost: updateServiceDto.cost ?? service.cost,
    });

    return this.servicesRepository.save(updatedService);
  }

  async remove(id: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} удаляет сервис ${id}`);
    const service = await this.servicesRepository.findOne({ where: { id }, relations: ['employee'] })
    if(!service) {
      throw new NotFoundException(`Сервис с id ${id} не найден`);
    }

    // Проверка роли: только MANAGER может удалять
    if (currentUser.role !== UserRole.MANAGER) {
      throw new UnauthorizedException(
          `Пользователь с ролью '${currentUser.role}' не может удалять сервис`,
      );
    }

    await this.servicesRepository.delete(id);
    return { message: `Сервис с id ${id} успешно удалён` };
  }
}