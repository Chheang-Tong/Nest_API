/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
@Controller('products')
export class ProductController {
  constructor(private readonly productsService: ProductService) {}

  // GET /products
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // GET /products/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  // PATCH /products/:id
  // @Patch(':id')
  // update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
  //   return this.productsService.update(id, dto);
  // }

  // DELETE /products/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  @Post('create')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        // filename: (req, file, cb) => {
        //   const uniqueSuffix =
        //     Date.now() + '-' + Math.round(Math.random() * 1e9);
        //   cb(null, uniqueSuffix + extname(file.originalname));
        // },
        filename: (req, file, cb) => {
          const bodyName = req.body.name || 'product';
          const safeName = bodyName.replace(/\s+/g, '_');

          const ext = extname(file.originalname);

          cb(null, `${safeName}${ext}`);
        },
      }),
    }),
  )
  async createProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateProductDto,
  ) {
    const imageUrl = file
      ? `http://localhost:3000/uploads/${file.filename}`
      : null;

    return this.productsService.create({
      ...dto,
      image: imageUrl ?? undefined,
    });
  }

  // @Post()
  // @UseInterceptors(
  //   FileInterceptor('image', {
  //     storage: diskStorage({
  //       destination: './uploads',
  //       filename: (req, file, cb) => {
  //         const originalName = req.body.name || 'product';
  //         const safeName = originalName
  //           .trim()
  //           .replace(/\s+/g, '_') // spaces → _
  //           .replace(/[^a-zA-Z0-9_]/g, ''); // remove strange chars
  //         const ext = extname(file.originalname);
  //         cb(null, `${safeName}${ext}`);
  //       },
  //     }),
  //   }),
  // )
  // async createsProduct(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body() dto: CreateProductDto,
  // ) {
  //   const imageUrl = file
  //     ? `http://localhost:3000/uploads/${file.filename}`
  //     : null;
  //   return this.productsService.create({
  //     ...dto,
  //     image: imageUrl ?? undefined,
  //   });
  // }

  // @Patch(':id')
  // @UseInterceptors(
  //   FileInterceptor('image', {
  //     storage: diskStorage({
  //       destination: './uploads',
  //       filename: (req, file, cb) => {
  //         const bodyName: string = req.body?.name || 'product';

  //         const safeName = bodyName
  //           .trim()
  //           .replace(/\s+/g, '_')
  //           .replace(/[^a-zA-Z0-9_]/g, '');

  //         const ext = extname(file.originalname);
  //         cb(null, `${safeName}${ext}`);
  //       },
  //     }),
  //   }),
  // )
  // async updates(
  //   @Param('id', ParseIntPipe) id: number,
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body() dto: UpdateProductDto,
  // ) {
  //   const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';

  //   const imageUrl = file ? `${baseUrl}/uploads/${file.filename}` : undefined;
  //   return this.productsService.update(id, {
  //     ...dto,
  //     ...(imageUrl ? { image: imageUrl } : {}),
  //   });
  // }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const bodyName = req.body?.name || 'product';

          const safeName = bodyName
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '');

          const ext = extname(file.originalname);
          cb(null, `${safeName}${ext}`);
        },
      }),
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateProductDto,
  ) {
    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';

    const newImageUrl = file
      ? `${baseUrl}/uploads/${file.filename}`
      : undefined;

    return this.productsService.update(id, {
      ...dto,
      ...(newImageUrl ? { image: newImageUrl } : {}),
    });
  }
}
