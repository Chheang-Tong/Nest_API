import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard) // you can limit to admin later
export class ReportsController {
  constructor(private readonly reportService: ReportsService) {}

  // 🔹 GET /reports/stock
  @Get('stock')
  getStockReport() {
    return this.reportService.getStockReport();
  }

  // 🔹 GET /reports/sales?from=2025-11-01&to=2025-11-30
  @Get('sales')
  getSalesReport(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportService.getSalesReport(from, to);
  }
}
