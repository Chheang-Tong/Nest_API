import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard';
import { ReportsService } from './reports.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportService: ReportsService) {}

  // 🔹 GET /reports/stock
  @Get('stock')
  @ApiOperation({
    summary: 'Get stock report',
    description:
      'Returns current stock, sold quantity, and revenue per product.',
  })
  getStockReport() {
    return this.reportService.getStockReport();
  }

  // 🔹 GET /reports/sales?from=2025-11-01&to=2025-11-30
  @Get('sales')
  @ApiOperation({
    summary: 'Get sales report',
    description:
      'Returns sales summary and list of sells. Optionally filter by date range.',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Start date (YYYY-MM-DD)',
    example: '2025-11-01',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'End date (YYYY-MM-DD)',
    example: '2025-11-30',
  })
  getSalesReport(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportService.getSalesReport(from, to);
  }
}
