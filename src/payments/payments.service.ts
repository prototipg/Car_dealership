import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payments } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Users, UserRole } from '../users/entities/user.entity';
import { Sales } from '../sales/entities/sale.entity';
import { Insurance } from '../insurance/entities/insurance.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
      @InjectRepository(Payments)
      private paymentsRepository: Repository<Payments>,
      @InjectRepository(Sales)
      private salesRepository: Repository<Sales>,
      @InjectRepository(Users)
      private usersRepository: Repository<Users>,
      @InjectRepository(Insurance)
      private insuranceRepository: Repository<Insurance>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} создаёт платёж`);

    if (![UserRole.CUSTOMER, UserRole.MANAGER].includes(currentUser.role)) {
      throw new UnauthorizedException(
          `Пользователь с ролью '${currentUser.role}' не может создавать платеж`,
      );
    }

    const sale = await this.salesRepository
        .findOneOrFail({ where: { id: createPaymentDto.sale_id }, relations: ['customer'] })
        .catch(() => {
          throw new NotFoundException(`Продажа с id ${createPaymentDto.sale_id} не найдена`);
        });

    if (currentUser.role === UserRole.CUSTOMER && sale.customer.id !== currentUser.id) {
      throw new UnauthorizedException('Клиенты могут создавать платежи только для своих продаж');
    }

    let user = currentUser;
    if (createPaymentDto.user_id && currentUser.role === UserRole.MANAGER) {
      user = await this.usersRepository
          .findOneOrFail({ where: { id: createPaymentDto.user_id, role: UserRole.CUSTOMER } })
          .catch(() => {
            throw new NotFoundException(
                `Пользователь с id ${createPaymentDto.user_id} не найден или не является клиентом`,
            );
          });
    }

    // Проверка страховки (если указана)
    let insurance: Insurance | null = null;
    if (createPaymentDto.insurance_id) {
      insurance = await this.insuranceRepository.findOne({ where: { id: createPaymentDto.insurance_id } })
      if(!insurance) {
        throw new NotFoundException(`Страховка с id ${createPaymentDto.insurance_id} не найдена`);
      }
    }

    // Проверка суммы частичной оплаты
    const totalPayments = await this.paymentsRepository
        .createQueryBuilder('payment')
        .where('payment.saleId = :saleId', { saleId: createPaymentDto.sale_id })
        .select('SUM(payment.amount)', 'total')
        .getRawOne();

    const currentTotal = (totalPayments?.total || 0) + createPaymentDto.amount;
    if (currentTotal > sale.price_sold) {
      throw new BadRequestException(
          `Сумма платежей (${currentTotal}) превышает стоимость продажи (${sale.price_sold})`,
      );
    }

    const payment = this.paymentsRepository.create({...createPaymentDto});

    return this.paymentsRepository.save(payment);
  }

  async findAll(currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} получает все платежи`);

    // Определяем, какие платежи может видеть пользователь
    const allowedToView = {
      [UserRole.MANAGER]: {}, // Менеджер видит все
      [UserRole.EMPLOYEE]: { sale: { employee: { id: currentUser.id } } }, // Сотрудник видит платежи по своим продажам
      [UserRole.CUSTOMER]: { user: { id: currentUser.id } }, // Клиент видит свои платежи
    };

    const where = allowedToView[currentUser.role] ?? {};
    return this.paymentsRepository.find({
      where,
      relations: ['sale', 'user', 'insurance', 'sale.customer', 'sale.employee'],
      select: {
        id: true,
        amount: true,
        payment_date: true,
        method: true,
        sale: { id: true, price_sold: true },
        user: { id: true, name: true, email: true },
        insurance: { id: true },
      },
    });
  }

  async findOne(id: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} запрашивает платёж ${id}`);
    const payment = await this.paymentsRepository
        .findOneOrFail({
          where: { id },
          relations: ['sale', 'user', 'insurance', 'sale.customer', 'sale.employee'],
          select: {
            id: true,
            amount: true,
            payment_date: true,
            method: true,
            sale: { id: true, price_sold: true },
            user: { id: true, name: true, email: true },
            insurance: { id: true },
          },
        })
        .catch(() => {
          throw new NotFoundException(`Платеж с id ${id} не найден`);
        });

    if (
        currentUser.role === UserRole.CUSTOMER &&
        payment.user.id !== currentUser.id
    ) {
      throw new UnauthorizedException('Клиенты могут просматривать только свои платежи');
    }
    if (
        currentUser.role === UserRole.EMPLOYEE &&
        payment.sale.employee?.id !== currentUser.id
    ) {
      throw new UnauthorizedException('Сотрудники могут просматривать только платежи по своим продажам');
    }

    return payment;
  }

  async findBySale(saleId: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} запрашивает платежи за продажу ${saleId}`);
    const sale = await this.salesRepository
        .findOneOrFail({ where: { id: saleId }, relations: ['customer', 'employee'] })
        .catch(() => {
          throw new NotFoundException(`Продажа с id ${saleId} не найдена`);
        });

    if (
        currentUser.role === UserRole.CUSTOMER &&
        sale.customer.id !== currentUser.id
    ) {
      throw new UnauthorizedException('Клиенты могут просматривать только свои платежи');
    }
    if (
        currentUser.role === UserRole.EMPLOYEE &&
        sale.employee?.id !== currentUser.id
    ) {
      throw new UnauthorizedException('Сотрудники могут просматривать только платежи по своим продажам');
    }

    return this.paymentsRepository.find({
      where: { sale: { id: saleId } },
      relations: ['sale', 'user', 'insurance', 'sale.customer', 'sale.employee'],
      select: {
        id: true,
        amount: true,
        payment_date: true,
        method: true,
        sale: { id: true, price_sold: true },
        user: { id: true, name: true, email: true },
        insurance: { id: true },
      },
    });
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} обновляет платёж ${id}`);
    const payment = await this.paymentsRepository
        .findOneOrFail({ where: { id }, relations: ['sale', 'user', 'insurance'] })
        .catch(() => {
          throw new NotFoundException(`Платеж с id ${id} не найден`);
        });

    if (currentUser.role !== UserRole.MANAGER) {
      throw new UnauthorizedException(
          `Пользователь с ролью '${currentUser.role}' не может обновлять платеж`,
      );
    }

    let insurance: Insurance | null = payment.insurance;
    if (updatePaymentDto.insurance_id) {
      insurance = await this.insuranceRepository
          .findOneOrFail({ where: { id: updatePaymentDto.insurance_id } })
          .catch(() => {
            throw new NotFoundException(`Страховка с id ${updatePaymentDto.insurance_id} не найдена`);
          });
    }

    if (updatePaymentDto.amount) {
      const totalPayments = await this.paymentsRepository
          .createQueryBuilder('payment')
          .where('payment.saleId = :saleId AND payment.id != :id', { saleId: payment.sale.id, id })
          .select('SUM(payment.amount)', 'total')
          .getRawOne();

      const currentTotal = (totalPayments?.total || 0) + updatePaymentDto.amount;
      if (currentTotal > payment.sale.price_sold) {
        throw new BadRequestException(
            `Сумма платежей (${currentTotal}) превышает стоимость продажи (${payment.sale.price_sold})`,
        );
      }
    }

    const updatedPayment = Object.assign(payment, {
      insurance,
      amount: updatePaymentDto.amount ?? payment.amount,
      payment_date: updatePaymentDto.payment_date
          ? new Date(updatePaymentDto.payment_date)
          : payment.payment_date,
      method: updatePaymentDto.method ?? payment.method,
    });

    return this.paymentsRepository.save(updatedPayment);
  }

  async remove(id: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} удаляет платёж ${id}`);
    const payment = await this.paymentsRepository.findOne({ where: { id }, relations: ['sale', 'user'] })
    if(!payment) {
      throw new NotFoundException(`Платеж с id ${id} не найден`);
    }

    if (currentUser.role !== UserRole.MANAGER) {
      throw new UnauthorizedException(
          `Пользователь с ролью '${currentUser.role}' не может удалять платеж`,
      );
    }

    await this.paymentsRepository.delete(id);
    return { message: `Платеж с id ${id} успешно удалён` };
  }
}