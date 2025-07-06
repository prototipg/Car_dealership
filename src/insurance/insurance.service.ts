import { Injectable, NotFoundException, UnauthorizedException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Insurance } from './entities/insurance.entity';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { UpdateInsuranceDto } from './dto/update-insurance.dto';
import { Users, UserRole } from '../users/entities/user.entity';
import { Sales } from '../sales/entities/sale.entity';

@Injectable()
export class InsuranceService {
  private readonly logger = new Logger(InsuranceService.name);

  constructor(
      @InjectRepository(Insurance)
      private insuranceRepository: Repository<Insurance>,
      @InjectRepository(Sales)
      private salesRepository: Repository<Sales>,
  ) {}

  async create(createInsuranceDto: CreateInsuranceDto, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} создаёт страховку`);

    if (currentUser.role !== UserRole.MANAGER) {
      throw new UnauthorizedException(
          `Пользователь с ролью '${currentUser.role}' не может создавать страховку`,
      );
    }

    const sale = await this.salesRepository
        .findOneOrFail({ where: { id: createInsuranceDto.sale_id } })
        .catch(() => {
          throw new NotFoundException(`Продажа с id ${createInsuranceDto.sale_id} не найдена`);
        });

    const existingInsurance = await this.insuranceRepository.findOne({ where: { sale: { id: sale.id } } });
    if (existingInsurance) {
      throw new BadRequestException(`Продажа с id ${sale.id} уже имеет страховку`);
    }

    const startDate = new Date(createInsuranceDto.start_date);
    const endDate = new Date(createInsuranceDto.end_date);
    if (startDate >= endDate) {
      throw new BadRequestException('Дата начала страховки должна быть раньше даты окончания');
    }

    const insurance = this.insuranceRepository.create({...createInsuranceDto});

    return this.insuranceRepository.save(insurance);
  }

  async findAll(currentUser: Users, status?: 'active' | 'expired') {
    this.logger.log(`Пользователь ${currentUser.id} получает доступ ко всем страховкам со статусом ${status || 'all'}`);

    // Определяем, какие страховки может видеть пользователь
    const allowedToView = {
      [UserRole.MANAGER]: {}, // Менеджер видит все
      [UserRole.EMPLOYEE]: {}, // Сотрудник видит все
      [UserRole.CUSTOMER]: { sale: { customer: { id: currentUser.id } } }, // Клиент видит свои
    };

    const where: any = allowedToView[currentUser.role] ?? {};
    if (status === 'active') {
      where.end_date = LessThan(new Date());
    } else if (status === 'expired') {
      where.end_date = LessThan(new Date());
    }

    return this.insuranceRepository.find({
      where,
      relations: ['sale', 'sale.customer', 'payments'],
      select: {
        id: true,
        provider: true,
        policy_number: true,
        start_date: true,
        end_date: true,
        premium_amount: true,
        sale: { id: true, price_sold: true },
        payments: { id: true, amount: true, payment_date: true },
      },
    });
  }

  async findOne(id: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} запрашивает страховку ${id}`);
    const insurance = await this.insuranceRepository
        .findOneOrFail({
          where: { id },
          relations: ['sale', 'sale.customer', 'payments'],
          select: {
            id: true,
            provider: true,
            policy_number: true,
            start_date: true,
            end_date: true,
            premium_amount: true,
            sale: { id: true, price_sold: true },
            payments: { id: true, amount: true, payment_date: true },
          },
        })
        .catch(() => {
          throw new NotFoundException(`Страховка с id ${id} не найдена`);
        });

    if (
        currentUser.role === UserRole.CUSTOMER &&
        insurance.sale.customer.id !== currentUser.id
    ) {
      throw new UnauthorizedException('Клиенты могут просматривать только свои страховки');
    }

    return insurance;
  }

  async findBySale(saleId: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} запрашивает информацию о продаже страховки ${saleId}`);
    const sale = await this.salesRepository
        .findOneOrFail({ where: { id: saleId }, relations: ['customer'] })
        .catch(() => {
          throw new NotFoundException(`Продажа с id ${saleId} не найдена`);
        });

    if (
        currentUser.role === UserRole.CUSTOMER &&
        sale.customer.id !== currentUser.id
    ) {
      throw new UnauthorizedException('Клиенты могут просматривать только свои страховки');
    }

    const insurance = await this.insuranceRepository.findOne({
      where: { sale: { id: saleId } },
      relations: ['sale', 'sale.customer', 'payments'],
      select: {
        id: true,
        provider: true,
        policy_number: true,
        start_date: true,
        end_date: true,
        premium_amount: true,
        sale: { id: true, price_sold: true },
        payments: { id: true, amount: true, payment_date: true },
      },
    });

    if (!insurance) {
      throw new NotFoundException(`Страховка для продажи с id ${saleId} не найдена`);
    }

    return insurance;
  }

  async update(id: string, updateInsuranceDto: UpdateInsuranceDto, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} обновляет страховку ${id}`);
    // Проверка роли: только MANAGER
    if (currentUser.role !== UserRole.MANAGER) {
      throw new UnauthorizedException(
          `Пользователь с ролью '${currentUser.role}' не может обновлять страховку`,
      );
    }

    const insurance = await this.insuranceRepository
        .findOneOrFail({ where: { id } })
        .catch(() => {
          throw new NotFoundException(`Страховка с id ${id} не найдена`);
        });

    let startDate = insurance.start_date;
    let endDate = insurance.end_date;
    if (updateInsuranceDto.start_date || updateInsuranceDto.end_date) {
      startDate = updateInsuranceDto.start_date ? new Date(updateInsuranceDto.start_date) : startDate;
      endDate = updateInsuranceDto.end_date ? new Date(updateInsuranceDto.end_date) : endDate;
      if (startDate >= endDate) {
        throw new BadRequestException('Дата начала страховки должна быть раньше даты окончания');
      }
    }

    const updatedInsurance = Object.assign(insurance, {
      provider: updateInsuranceDto.provider ?? insurance.provider,
      policy_number: updateInsuranceDto.policy_number ?? insurance.policy_number,
      start_date: startDate,
      end_date: endDate,
      premium_amount: updateInsuranceDto.premium_amount ?? insurance.premium_amount,
    });

    return this.insuranceRepository.save(updatedInsurance);
  }

  async remove(id: string, currentUser: Users) {
    this.logger.log(`Пользователь ${currentUser.id} удаляет страховку ${id}`);
    // Проверка роли: только MANAGER
    if (currentUser.role !== UserRole.MANAGER) {
      throw new UnauthorizedException(
          `Пользователь с ролью '${currentUser.role}' не может удалять страховку`,
      );
    }

    const insurance = await this.insuranceRepository.findOne({ where: { id } })
    if(!insurance){
      throw new NotFoundException(`Страховка с id ${id} не найдена`);
    }

    await this.insuranceRepository.delete(id);
    return { message: `Страховка с id ${id} успешно удалена` };
  }
}