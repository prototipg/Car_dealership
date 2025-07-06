import { Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sales } from './entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Users, UserRole } from '../users/entities/user.entity';
import { Cars } from '../cars/entities/car.entity';
import { Insurance } from '../insurance/entities/insurance.entity';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
      @InjectRepository(Sales)
      private salesRepository: Repository<Sales>,
      @InjectRepository(Cars)
      private carsRepository: Repository<Cars>,
      @InjectRepository(Users)
      private usersRepository: Repository<Users>,
      @InjectRepository(Insurance)
      private insuranceRepository: Repository<Insurance>,
  ) {}

  async create(createSaleDto: CreateSaleDto, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} создаёт распродажу`);
    if (currentUser.role !== UserRole.MANAGER) {
      throw new UnauthorizedException(
          `Пользователь с ролью '${currentUser.role}' не может создавать продажу`,
      );
    }

    const car = await this.carsRepository.findOne({ where: { id: createSaleDto.car_id } })
    if(!car){
      throw new NotFoundException(`Автомобиль с id ${createSaleDto.car_id} не найден`);
    }

    const customer = await this.usersRepository.findOne({ where: { id: createSaleDto.customer_id, role: UserRole.CUSTOMER } })
    if(!customer){
      throw new NotFoundException(
        `Клиент с id ${createSaleDto.customer_id} не найден или не является клиентом`,
      );
    }

    // Проверка сотрудника (если указан)
    let employee: Users | null = null;
    if (createSaleDto.employee_id) {
      employee = await this.usersRepository.findOne({ where: { id: createSaleDto.employee_id, role: UserRole.EMPLOYEE } })
      if(!employee) {
        throw new NotFoundException(
          `Сотрудник с id ${createSaleDto.employee_id} не найден или не является сотрудником`,
        );
      }
    }

    let insurance: Insurance | null = null;
    if (createSaleDto.insurance_id) {
      insurance = await this.insuranceRepository.findOne({ where: { id: createSaleDto.insurance_id } })
      if(!insurance) {
        throw new NotFoundException(`Страховка с id ${createSaleDto.insurance_id} не найдена`);
      }
    }

    const sale = this.salesRepository.create({...createSaleDto});

    return this.salesRepository.save(sale);
  }

  async findAll(currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} получает информацию обо всех продажах`);

    // Определяем, какие продажи может видеть пользователь
    const allowedToView = {
      [UserRole.MANAGER]: {}, // Менеджер видит все
      [UserRole.EMPLOYEE]: { employee: { id: currentUser.id } }, // Сотрудник видит свои продажи
      [UserRole.CUSTOMER]: { customer: { id: currentUser.id } }, // Клиент видит свои покупки
    };

    const where = allowedToView[currentUser.role] ?? {};
    return this.salesRepository.find({
      where,
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

  async findOne(id: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} запрашивает продажу ${id}`);
    const sale = await this.salesRepository
        .findOneOrFail({
          where: { id },
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
        })
        .catch(() => {
          throw new NotFoundException(`Продажа с id ${id} не найдена`);
        });

    if (
        currentUser.role === UserRole.CUSTOMER &&
        sale.customer.id !== currentUser.id
    ) {
      throw new UnauthorizedException('Клиенты могут просматривать только свои покупки');
    }
    if (
        currentUser.role === UserRole.EMPLOYEE &&
        sale.employee?.id !== currentUser.id
    ) {
      throw new UnauthorizedException('Сотрудники могут просматривать только свои продажи');
    }

    return sale;
  }

  async findByCustomer(customerId: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} запрашивает данные о продажах для клиента ${customerId}`);
    // Проверка: менеджер или сам клиент
    if (
        currentUser.role !== UserRole.MANAGER &&
        currentUser.id !== customerId
    ) {
      throw new UnauthorizedException(
          'Только менеджер или сам клиент могут просматривать историю покупок клиента',
      );
    }

    return this.salesRepository.find({
      where: { customer: { id: customerId } },
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

  async update(id: string, updateSaleDto: UpdateSaleDto, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} обновляет продажу ${id}`);
    const sale = await this.salesRepository
        .findOneOrFail({ where: { id }, relations: ['customer', 'employee', 'insurance'] })
        .catch(() => {
          throw new NotFoundException(`Продажа с id ${id} не найдена`);
        });

    if (currentUser.role !== UserRole.MANAGER) {
      throw new UnauthorizedException(
          `Пользователь с ролью '${currentUser.role}' не может обновлять продажу`,
      );
    }

    let employee: Users | null = sale.employee;
    if (updateSaleDto.employee_id) {
      employee = await this.usersRepository
          .findOneOrFail({ where: { id: updateSaleDto.employee_id, role: UserRole.EMPLOYEE } })
          .catch(() => {
            throw new NotFoundException(
                `Сотрудник с id ${updateSaleDto.employee_id} не найден или не является сотрудником`,
            );
          });
    }

    let insurance: Insurance | null = sale.insurance;
    if (updateSaleDto.insurance_id) {
      insurance = await this.insuranceRepository
          .findOneOrFail({ where: { id: updateSaleDto.insurance_id } })
          .catch(() => {
            throw new NotFoundException(`Страховка с id ${updateSaleDto.insurance_id} не найдена`);
          });
    }

    const updatedSale = Object.assign(sale, {
      employee,
      insurance,
      price_sold: updateSaleDto.price_sold ?? sale.price_sold,
    });

    return this.salesRepository.save(updatedSale);
  }

  async remove(id: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} удаляет продажу ${id}`);
    const sale = await this.salesRepository.findOne({ where: { id }, relations: ['customer', 'employee'] })
    if(!sale) {
      throw new NotFoundException(`Продажа с id ${id} не найдена`);
    }

    if (currentUser.role !== UserRole.MANAGER) {
      throw new UnauthorizedException(
          `Пользователь с ролью '${currentUser.role}' не может удалять продажу`,
      );
    }

    await this.salesRepository.delete(id);
    return { message: `Продажа с id ${id} успешно удалена` };
  }
}