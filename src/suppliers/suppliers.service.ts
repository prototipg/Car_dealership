import { Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Suppliers } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Users, UserRole } from '../users/entities/user.entity';
import { Cars } from '../cars/entities/car.entity';

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(
      @InjectRepository(Suppliers)
      private suppliersRepository: Repository<Suppliers>,
      @InjectRepository(Cars)
      private carsRepository: Repository<Cars>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} создаёт поставщика`);

    // Проверка роли: только MANAGER может создавать запись о поставке
    if (currentUser.role !== UserRole.MANAGER) {
      throw new UnauthorizedException(
          `Пользователь с ролью '${currentUser.role}' не может создавать запись о поставке`,
      );
    }

    // Проверка автомобиля
    const car = await this.carsRepository.findOne({ where: { id: createSupplierDto.car_id } })
    if(!car) {
      throw new NotFoundException(`Автомобиль с id ${createSupplierDto.car_id} не найден`);
    }

    const supplier = this.suppliersRepository.create({car,...createSupplierDto });
    return this.suppliersRepository.save(supplier);
  }

  async findAll(currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} запрашивает всех поставщиков`);

    // Проверка роли: только MANAGER и EMPLOYEE
    if (![UserRole.MANAGER, UserRole.EMPLOYEE].includes(currentUser.role)) {
      throw new UnauthorizedException(
          `Пользователь с ролью '${currentUser.role}' не может просматривать записи о поставках`,
      );
    }

    return this.suppliersRepository.find({
      relations: ['car'],
      select: {
        id: true,
        received_date: true,
        source: true,
        purchase_price: true,
        car: { id: true, model: true },
      },
    });
  }

  async findOne(id: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} запрашивает данные о поставщике ${id}`);
    // Проверка роли: только MANAGER и EMPLOYEE
    if (![UserRole.MANAGER, UserRole.EMPLOYEE].includes(currentUser.role)) {
      throw new UnauthorizedException(
          `Пользователь с ролью '${currentUser.role}' не может просматривать запись о поставке`,
      );
    }

    const supplier = await this.suppliersRepository
        .findOne({
          where: { id },
          relations: ['car'],
          select: {
            id: true,
            received_date: true,
            source: true,
            purchase_price: true,
            car: { id: true, model: true },
          },
        })
    if(!supplier){
      throw new NotFoundException(`Поставка с id ${id} не найдена`);
    }

    return supplier;
  }

  async findByCar(carId: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} ищет поставщиков для автомобиля ${carId}`);
    // Проверка роли: только MANAGER и EMPLOYEE
    if (![UserRole.MANAGER, UserRole.EMPLOYEE].includes(currentUser.role)) {
      throw new UnauthorizedException(
          `Пользователь с ролью '${currentUser.role}' не может просматривать историю поставок автомобиля`,
      );
    }

    const car = await this.carsRepository.findOne({ where: { id: carId } })
    if(!car){
      throw new NotFoundException(`Автомобиль с id ${carId} не найден`);
    }

    return this.suppliersRepository.find({
      where: { car: { id: carId } },
      relations: ['car'],
      select: {
        id: true,
        received_date: true,
        source: true,
        purchase_price: true,
        car: { id: true, model: true },
      },
    });
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} обновляет данные о поставщике ${id}`);
    // Проверка роли: только MANAGER
    if (currentUser.role !== UserRole.MANAGER) {
      throw new UnauthorizedException(
          `Пользователь с ролью '${currentUser.role}' не может обновлять запись о поставке`,
      );
    }

    const supplier = await this.suppliersRepository.findOne({ where: { id } })
    if(!supplier) {
      throw new NotFoundException(`Поставка с id ${id} не найдена`);
    }

    const updatedSupplier = Object.assign(supplier, {
      received_date: updateSupplierDto.received_date
          ? new Date(updateSupplierDto.received_date)
          : supplier.received_date,
      source: updateSupplierDto.source ?? supplier.source,
      purchase_price: updateSupplierDto.purchase_price ?? supplier.purchase_price,
    });

    return this.suppliersRepository.save(updatedSupplier);
  }

  async remove(id: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} удаляет поставщика ${id}`);
    // Проверка роли: только MANAGER
    if (currentUser.role !== UserRole.MANAGER) {
      throw new UnauthorizedException(
          `Пользователь с ролью '${currentUser.role}' не может удалять запись о поставке`,
      );
    }

    const supplier = await this.suppliersRepository.findOne({ where: { id } })
    if(!supplier) {
      throw new NotFoundException(`Поставка с id ${id} не найдена`);
    }

    await this.suppliersRepository.delete(id);
    return { message: `Поставка с id ${id} успешно удалена` };
  }
}