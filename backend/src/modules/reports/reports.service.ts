import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { stringify } from 'csv-stringify/sync';
import PDFDocument from 'pdfkit';
import { User } from '../users/user.entity';
import { MemberProfile } from '../members/member-profile.entity';
import { Event } from '../events/event.entity';
import { Donation } from '../donations/donation.entity';
import { Souvenir } from '../souvenirs/souvenir.entity';
import { Subscription } from '../subscriptions/subscription.entity';

/**
 * Servicio para generar reportes en formatos CSV y PDF.
 * Permite exportar datos de diferentes entidades del sistema.
 */
@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(MemberProfile)
    private membersRepository: Repository<MemberProfile>,
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(Donation)
    private donationsRepository: Repository<Donation>,
    @InjectRepository(Souvenir)
    private souvenirsRepository: Repository<Souvenir>,
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
  ) {}

  /**
   * Genera un reporte de usuarios en formato CSV
   */
  async generateUsersCSV(): Promise<Buffer> {
    const users = await this.usersRepository.find({ relations: ['roles'] });
    
    const data = users.map(user => ({
      ID: user.id,
      'Nombre Completo': user.nombreCompleto,
      Correo: user.correo,
      Usuario: user.usuario || 'N/A',
      Teléfono: user.telefono || 'N/A',
      Género: user.genero || 'N/A',
      Capítulo: user.capitulo || 'N/A',
      Estado: user.estado,
      Roles: user.roles?.map(r => r.name).join(', ') || 'Sin roles',
      'Fecha Registro': user.fechaRegistro?.toISOString().split('T')[0] || 'N/A',
    }));

    const csv = stringify(data, { header: true });
    return Buffer.from(csv);
  }

  /**
   * Genera un reporte de miembros en formato CSV
   */
  async generateMembersCSV(): Promise<Buffer> {
    const members = await this.membersRepository.find({ relations: ['user'] });
    
    const data = members.map(member => ({
      ID: member.userId,
      Nombre: member.user?.nombreCompleto || 'N/A',
      'Número Membresía': member.membershipNumber || 'N/A',
      'Tipo Miembro': member.membershipType || 'N/A',
      Capítulo: member.chapter || 'N/A',
      Estado: member.status || 'N/A',
      'Fecha Ingreso': member.memberSince?.toISOString().split('T')[0] || 'N/A',
    }));

    const csv = stringify(data, { header: true });
    return Buffer.from(csv);
  }

  /**
   * Genera un reporte de eventos en formato CSV
   */
  async generateEventsCSV(): Promise<Buffer> {
    const events = await this.eventsRepository.find();
    
    const data = events.map(event => ({
      ID: event.id,
      Título: event.title,
      Descripción: event.description || 'N/A',
      Fecha: event.eventDate?.toISOString().split('T')[0] || 'N/A',
      Ubicación: event.location || 'N/A',
      Estado: event.status,
      Capacidad: event.capacity,
      Registrados: event.registeredCount,
    }));

    const csv = stringify(data, { header: true });
    return Buffer.from(csv);
  }

  /**
   * Genera un reporte de donaciones en formato CSV
   */
  async generateDonationsCSV(): Promise<Buffer> {
    const donations = await this.donationsRepository.find();
    
    const data = donations.map(donation => ({
      ID: donation.id,
      Usuario: donation.userId || 'Anónimo',
      Monto: `$${donation.amount.toFixed(2)}`,
      Moneda: donation.currency,
      Fecha: donation.createdAt?.toISOString().split('T')[0] || 'N/A',
      'Método Pago': donation.paymentMethod || 'N/A',
      Estado: donation.status,
    }));

    const csv = stringify(data, { header: true });
    return Buffer.from(csv);
  }

  /**
   * Genera un reporte de inventario de souvenirs en formato CSV
   */
  async generateSouvenirsCSV(): Promise<Buffer> {
    const souvenirs = await this.souvenirsRepository.find();
    
    const data = souvenirs.map(item => ({
      ID: item.id,
      Nombre: item.name,
      Descripción: item.description || 'N/A',
      Precio: `$${item.price.toFixed(2)}`,
      Inventario: item.stock,
      Categoría: item.category || 'N/A',
      Estado: item.status,
    }));

    const csv = stringify(data, { header: true });
    return Buffer.from(csv);
  }

  /**
   * Genera un reporte de suscriptores en formato CSV
   */
  async generateSubscriptionsCSV(): Promise<Buffer> {
    const subscriptions = await this.subscriptionsRepository.find();
    
    const data = subscriptions.map(sub => ({
      ID: sub.id,
      Correo: sub.email,
      Nombre: sub.name || 'N/A',
      Tipo: sub.type,
      Fecha: sub.createdAt?.toISOString().split('T')[0] || 'N/A',
      Estado: sub.status,
    }));

    const csv = stringify(data, { header: true });
    return Buffer.from(csv);
  }

  /**
   * Genera un reporte en formato PDF
   * @param title - Título del reporte
   * @param data - Datos a incluir en el PDF
   */
  async generatePDF(title: string, data: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Encabezado
      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, { align: 'center' });
      doc.moveDown(2);

      // Tabla de datos
      doc.fontSize(12);
      data.forEach((item, index) => {
        if (index > 0 && index % 20 === 0) {
          doc.addPage();
        }

        doc.fontSize(10);
        Object.entries(item).forEach(([key, value]) => {
          doc.text(`${key}: ${value}`, { continued: false });
        });
        doc.moveDown(0.5);
      });

      doc.end();
    });
  }

  /**
   * Genera un reporte de usuarios en formato PDF
   */
  async generateUsersPDF(): Promise<Buffer> {
    const users = await this.usersRepository.find({ relations: ['roles'] });
    
    const data = users.map(user => ({
      Nombre: user.nombreCompleto,
      Correo: user.correo,
      Capítulo: user.capitulo || 'N/A',
      Roles: user.roles?.map(r => r.name).join(', ') || 'Sin roles',
    }));

    return this.generatePDF('Reporte de Usuarios', data);
  }

  /**
   * Genera un reporte de donaciones en formato PDF
   */
  async generateDonationsPDF(): Promise<Buffer> {
    const donations = await this.donationsRepository.find();
    
    const data = donations.map(donation => ({
      Usuario: donation.userId || 'Anónimo',
      Monto: `$${donation.amount.toFixed(2)}`,
      Fecha: donation.createdAt?.toISOString().split('T')[0] || 'N/A',
      Método: donation.paymentMethod || 'N/A',
    }));

    return this.generatePDF('Reporte de Donaciones', data);
  }
}
