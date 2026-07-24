import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('count')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getCounts() {
    return this.dashboardService.getCounts();
  }
}
