import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promoRepo: Repository<Promotion>,
  ) {}

  async create(dto: CreatePromotionDto): Promise<Promotion> {
    const promo = this.promoRepo.create({
      ...dto,
      code: dto.code.toUpperCase(),
    });
    return this.promoRepo.save(promo);
  }

  findAll() {
    return this.promoRepo.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: number) {
    return this.promoRepo.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdatePromotionDto) {
    const promo = await this.promoRepo.findOne({ where: { id } });
    if (!promo) throw new NotFoundException('Promotion not found');
    Object.assign(promo, dto);
    if (dto.code) promo.code = dto.code.toUpperCase();
    return this.promoRepo.save(promo);
  }

  async remove(id: number) {
    const promo = await this.promoRepo.findOne({ where: { id } });
    if (!promo) throw new NotFoundException('Promotion not found');
    await this.promoRepo.remove(promo);
    return { success: true };
  }

  // 🔹 called from SellService.checkout()
  async applyPromotion(total: number, code?: string) {
    if (!code) {
      return {
        promotion: null,
        discountDollar: 0,
        discountPercent: 0,
        finalTotal: total,
      };
    }

    const promo = await this.promoRepo.findOne({
      where: { code: code.toUpperCase(), isActive: true },
    });

    if (!promo) {
      throw new BadRequestException('Invalid promotion code');
    }

    const now = new Date();
    if (promo.startDate && now < promo.startDate) {
      throw new BadRequestException('Promotion not started yet');
    }
    if (promo.endDate && now > promo.endDate) {
      throw new BadRequestException('Promotion expired');
    }
    if (promo.minOrderTotal && total < Number(promo.minOrderTotal)) {
      throw new BadRequestException(
        `Minimum order ${promo.minOrderTotal} required`,
      );
    }

    let discountDollar = 0;
    let discountPercent = 0;

    if (promo.type === 'PERCENT') {
      discountPercent = Number(promo.value);
      discountDollar = (total * discountPercent) / 100;
    } else {
      discountDollar = Number(promo.value);
      discountPercent = total > 0 ? (discountDollar / total) * 100 : 0;
    }

    if (discountDollar > total) discountDollar = total;

    const finalTotal = total - discountDollar;

    return { promotion: promo, discountDollar, discountPercent, finalTotal };
  }
}
