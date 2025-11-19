import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

/**
 * Controlador para generación de reportes.
 * Todos los endpoints requieren autenticación y roles administrativos.
 */
@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  /**
   * Genera un reporte de usuarios en CSV o PDF
   */
  @Get('users')
  @Roles('Administrador', 'Presidente', 'Vicepresidente')
  @ApiOperation({ summary: 'Generar reporte de usuarios' })
  @ApiQuery({ name: 'format', enum: ['csv', 'pdf'] })
  async getUsersReport(@Query('format') format: string, @Res() res: Response) {
    if (format === 'pdf') {
      const buffer = await this.reportsService.generateUsersPDF();
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="usuarios_${Date.now()}.pdf"`,
      });
      res.send(buffer);
    } else {
      const buffer = await this.reportsService.generateUsersCSV();
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="usuarios_${Date.now()}.csv"`,
      });
      res.send(buffer);
    }
  }

  /**
   * Genera un reporte de miembros en CSV
   */
  @Get('members')
  @Roles('Administrador', 'Presidente', 'Secretario')
  @ApiOperation({ summary: 'Generar reporte de miembros' })
  @ApiQuery({ name: 'format', enum: ['csv', 'pdf'] })
  async getMembersReport(@Query('format') format: string, @Res() res: Response) {
    const buffer = await this.reportsService.generateMembersCSV();
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="miembros_${Date.now()}.csv"`,
    });
    res.send(buffer);
  }

  /**
   * Genera un reporte de eventos en CSV
   */
  @Get('events')
  @Roles('Administrador', 'Presidente', 'MTO')
  @ApiOperation({ summary: 'Generar reporte de eventos' })
  @ApiQuery({ name: 'format', enum: ['csv', 'pdf'] })
  async getEventsReport(@Query('format') format: string, @Res() res: Response) {
    const buffer = await this.reportsService.generateEventsCSV();
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="eventos_${Date.now()}.csv"`,
    });
    res.send(buffer);
  }

  /**
   * Genera un reporte de donaciones en CSV o PDF
   */
  @Get('donations')
  @Roles('Administrador', 'Presidente', 'Tesorero')
  @ApiOperation({ summary: 'Generar reporte de donaciones' })
  @ApiQuery({ name: 'format', enum: ['csv', 'pdf'] })
  async getDonationsReport(@Query('format') format: string, @Res() res: Response) {
    if (format === 'pdf') {
      const buffer = await this.reportsService.generateDonationsPDF();
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="donaciones_${Date.now()}.pdf"`,
      });
      res.send(buffer);
    } else {
      const buffer = await this.reportsService.generateDonationsCSV();
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="donaciones_${Date.now()}.csv"`,
      });
      res.send(buffer);
    }
  }

  /**
   * Genera un reporte de inventario de souvenirs en CSV
   */
  @Get('souvenirs')
  @Roles('Administrador', 'GerenciaNegocios')
  @ApiOperation({ summary: 'Generar reporte de inventario' })
  @ApiQuery({ name: 'format', enum: ['csv', 'pdf'] })
  async getSouvenirsReport(@Query('format') format: string, @Res() res: Response) {
    const buffer = await this.reportsService.generateSouvenirsCSV();
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="inventario_${Date.now()}.csv"`,
    });
    res.send(buffer);
  }

  /**
   * Genera un reporte de suscriptores en CSV
   */
  @Get('subscriptions')
  @Roles('Administrador', 'CommunityManager')
  @ApiOperation({ summary: 'Generar reporte de suscriptores' })
  @ApiQuery({ name: 'format', enum: ['csv', 'pdf'] })
  async getSubscriptionsReport(@Query('format') format: string, @Res() res: Response) {
    const buffer = await this.reportsService.generateSubscriptionsCSV();
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="suscriptores_${Date.now()}.csv"`,
    });
    res.send(buffer);
  }
}
