import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Cars, CarStatus } from './entities/car.entity';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Users, UserRole } from '../users/entities/user.entity';
import { Sales } from '../sales/entities/sale.entity';
import { TestDrives } from '../test-drives/entities/test-drive.entity';
import { Services } from '../services/entities/service.entity';
import { Suppliers } from '../suppliers/entities/supplier.entity';

@Injectable()
export class CarsService {
  private readonly logger = new Logger(CarsService.name);

  constructor(
      @InjectRepository(Cars)
      private carsRepository: Repository<Cars>,
      @InjectRepository(Sales)
      private salesRepository: Repository<Sales>,
      @InjectRepository(TestDrives)
      private testDrivesRepository: Repository<TestDrives>,
      @InjectRepository(Services)
      private servicesRepository: Repository<Services>,
      @InjectRepository(Suppliers)
      private suppliersRepository: Repository<Suppliers>,
  ) {}

  async create(createCarDto: CreateCarDto, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} создаёт автомобиль`);

    // Проверка роли: только MANAGER может создавать автомобиль
    if (currentUser.role !== UserRole.MANAGER) {
      throw new UnauthorizedException(
          `Пользователь с ролью '${currentUser.role}' не может создавать автомобиль`,
      );
    }

    // Проверка уникальности VIN
    const existingCar = await this.carsRepository.findOne({ where: { vin: createCarDto.vin } });
    if (existingCar) {
      throw new BadRequestException(`Автомобиль с VIN ${createCarDto.vin} уже существует`);
    }

    const car = this.carsRepository.create({
      ...createCarDto,
      status: createCarDto.status || CarStatus.AVAILABLE,
    });

    return this.carsRepository.save(car);
  }

  async findAll(currentUser: Users, filters: { model?: string; year?: number; color?: string; status?: CarStatus }, sort: { field?: string; order?: 'ASC' | 'DESC' }, page = 1, limit = 10) {
    this.logger.log(`Пользователь ${currentUser.id} выбирает автомобили с помощью фильтров`);

    // Проверка роли: клиенты видят только доступные автомобили
    const where: any = {};
    if (currentUser.role === UserRole.CUSTOMER) {
      where.status = CarStatus.AVAILABLE;
    }

    // Применение фильтров
    if (filters.model) {
      where.model = Like(`%${filters.model}%`);
    }
    if (filters.year) {
      where.year = filters.year;
    }
    if (filters.color) {
      where.color = Like(`%${filters.color}%`);
    }
    if (filters.status && currentUser.role !== UserRole.CUSTOMER) {
      where.status = filters.status;
    }

    // Применение сортировки
    const order: any = {};
    if (sort.field && ['model', 'year', 'price', 'mileage', 'color', 'status'].includes(sort.field)) {
      order[sort.field] = sort.order || 'ASC';
    } else {
      order.model = 'ASC'; // Сортировка по умолчанию
    }

    return this.carsRepository.find({
      where,
      select: ['id', 'model', 'year', 'vin', 'price', 'status', 'mileage', 'color'],
      skip: (page - 1) * limit,
      take: limit,
      order,
    });
  }

  async findOne(id: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} запрашивает автомобиль ${id}`);
    const car = await this.carsRepository
        .findOneOrFail({ where: { id }, select: ['id', 'model', 'year', 'vin', 'price', 'status', 'mileage', 'color'] })
        .catch(() => {
          throw new NotFoundException(`Автомобиль с id ${id} не найден`);
        });

    // Проверка доступа: клиенты видят только доступные автомобили
    if (currentUser.role === UserRole.CUSTOMER && car.status !== CarStatus.AVAILABLE) {
      throw new UnauthorizedException('Клиенты могут просматривать только доступные автомобили');
    }

    return car;
  }

  async findSalesHistory(carId: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} запрашивает историю продаж автомобиля ${carId}`);
    // Проверка роли: только MANAGER и EMPLOYEE
    if (![UserRole.MANAGER, UserRole.EMPLOYEE].includes(currentUser.role)) {
      throw new UnauthorizedException(
          'Только менеджеры и сотрудники могут просматривать историю продаж автомобиля',
      );
    }

    const car = await this.carsRepository.findOne({ where: { id: carId } })
    if(!car) {
      throw new NotFoundException(`Автомобиль с id ${carId} не найден`);
    }

    return this.salesRepository.find({
      where: { car: { id: carId } },
      relations: ['car', 'customer', 'employee', 'insurance'],
      select: {
        id: true,
        sale_date: true,
        price_sold: true,
        car: { id: true, model: true },
        customer: { id: true, name: true, email: true },
        employee: { id: true, name: true, email: true },
        insurance: { id: true },
      },
    });
  }

  async findServicesHistory(carId: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} запрашивает историю обслуживания автомобиля ${carId}`);
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
      relations: ['car', 'customer', 'employee', 'insurance'],
      select: {
        id: true,
        service_date: true,
        description: true,
        cost: true,
        car: { id: true, model: true },
        employee: { id: true, name: true, email: true },
      }
    });
  }

  async update(id: string, updateCarDto: UpdateCarDto, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} обновляет автомобиль ${id}`);
    const car = await this.carsRepository
        .findOneOrFail({ where: { id } })
        .catch(() => {
          throw new NotFoundException(`Автомобиль с id ${id} не найден`);
        });

    // Проверка роли: только MANAGER может обновлять
    if (currentUser.role !== UserRole.MANAGER) {
      throw new UnauthorizedException(
        `Пользователь с ролью '${currentUser.role}' не может обновлять автомобиль`,
      );
    }

    // Проверка уникальности VIN, если обновляется
    if (updateCarDto.vin && updateCarDto.vin !== car.vin) {
      const existingCar = await this.carsRepository.findOne({ where: { vin: updateCarDto.vin } });
      if (existingCar) {
        throw new BadRequestException(`Автомобиль с VIN ${updateCarDto.vin} уже существует`);
      }
    }

    const updatedCar = Object.assign(car, updateCarDto);
      return this.carsRepository.save(updatedCar);
  }

  async remove(id: string, currentUser: Users) {
    this.logger.log(`User ${currentUser.id} is deleting car ${id}`);
    const car = await this.carsRepository.findOne({ where: { id } })
    if(!car) {
      throw new NotFoundException(`Автомобиль с id ${id} не найден`);
    }

    // Проверка роли: только MANAGER может удалять
    if (currentUser.role !== UserRole.MANAGER) {
      throw new UnauthorizedException(
        `Пользователь с ролью '${currentUser.role}' не может удалять автомобиль`,
      );
    }

    // Проверка связей
    const sales = await this.salesRepository.count({ where: { car: { id } } });
    const testDrives = await this.testDrivesRepository.count({ where: { car: { id } } });
    const services = await this.servicesRepository.count({ where: { car: { id } } });
    const suppliers = await this.suppliersRepository.count({ where: { car: { id } } });

    if (sales > 0 || testDrives > 0 || services > 0 || suppliers > 0) {
      throw new BadRequestException(
        'Нельзя удалить автомобиль, так как он участвует в продажах, тест-драйвах, сервисах или поставках',
      );
    }

    await this.carsRepository.delete(id);
    return { message: `Автомобиль с id ${id} успешно удалён` };
  }
}