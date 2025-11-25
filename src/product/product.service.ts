import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { join } from 'path';
import * as fs from 'fs';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  // 🔹 create product
  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productsRepo.create(dto);
    return this.productsRepo.save(product);
  }

  // 🔹 get all products
  async findAll(): Promise<Product[]> {
    return this.productsRepo.find();
  }

  // 🔹 get one product by id
  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  // // 🔹 update product
  // async update(id: number, dto: UpdateProductDto): Promise<Product> {
  //   const product = await this.findOne(id);

  //   Object.assign(product, dto); // merge dto into entity

  //   return this.productsRepo.save(product);
  // }
  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    // 🔥 If new image is uploaded, delete old one
    if (dto.image && product.image && product.image !== dto.image) {
      const oldFile = product.image.split('/uploads/')[1]; // filename only

      if (oldFile) {
        const filePath = join(__dirname, '..', '..', 'uploads', oldFile);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.warn('⚠️ Could not delete old image:', err.message);
          } else {
            console.log('🗑️ Deleted old image:', oldFile);
          }
        });
      }
    }

    Object.assign(product, dto);

    return this.productsRepo.save(product);
  }

  // 🔹 delete product
  async remove(id: number): Promise<{ message: string }> {
    const result = await this.productsRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Product not found');
    }

    return { message: 'Product deleted successfully' };
  }
}
