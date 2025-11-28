import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

/**
 * Interfaz para los datos del formulario de inscripción.
 */
export interface ApplicationFormData {
  id: string;
  nombres: string;
  apellidos: string;
  identificacion: string;
  direccion?: string;
  telefonos?: string;
  actividadLaboral?: string;
  parejaNombre?: string;
  hijos?: string;
  vehiculoMarca?: string;
  vehiculoReferencia?: string;
  vehiculoPlaca?: string;
  certificacionTexto?: string;
  fechaCreacion: Date;
}

/**
 * Servicio para generación de PDF de formularios de inscripción.
 * Genera un documento PDF con el formato institucional de la Fundación L.A.M.A. Medellín.
 */
export class PDFService {
  /**
   * Genera un PDF del formulario de inscripción y retorna un stream.
   * @param data Datos del formulario de inscripción
   * @returns Stream del PDF generado
   */
  static generateApplicationFormPDF(data: ApplicationFormData): PassThrough {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const stream = new PassThrough();
    doc.pipe(stream);

    // Header institucional
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('Fundación L.A.M.A. Medellín', { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(14)
      .font('Helvetica')
      .text('Formulario de Inscripción', { align: 'center' })
      .moveDown(1);

    doc
      .fontSize(10)
      .text(`Fecha de recepción: ${data.fechaCreacion.toLocaleDateString('es-CO')}`, {
        align: 'right',
      })
      .moveDown(1);

    // Sección: Información Personal
    this.addSection(doc, 'Información Personal');
    this.addField(doc, 'Nombres', data.nombres);
    this.addField(doc, 'Apellidos', data.apellidos);
    this.addField(doc, 'Identificación', data.identificacion);
    if (data.direccion) this.addField(doc, 'Dirección', data.direccion);
    if (data.telefonos) this.addField(doc, 'Teléfonos', data.telefonos);
    if (data.actividadLaboral) this.addField(doc, 'Actividad Laboral', data.actividadLaboral);
    doc.moveDown(1);

    // Sección: Información Familiar
    if (data.parejaNombre || data.hijos) {
      this.addSection(doc, 'Información Familiar');
      if (data.parejaNombre) this.addField(doc, 'Pareja', data.parejaNombre);
      if (data.hijos) this.addField(doc, 'Hijos', data.hijos);
      doc.moveDown(1);
    }

    // Sección: Información del Vehículo
    if (data.vehiculoMarca || data.vehiculoReferencia || data.vehiculoPlaca) {
      this.addSection(doc, 'Información del Vehículo');
      if (data.vehiculoMarca) this.addField(doc, 'Marca', data.vehiculoMarca);
      if (data.vehiculoReferencia) this.addField(doc, 'Referencia', data.vehiculoReferencia);
      if (data.vehiculoPlaca) this.addField(doc, 'Placa', data.vehiculoPlaca);
      doc.moveDown(1);
    }

    // Sección: Certificación
    if (data.certificacionTexto) {
      this.addSection(doc, 'Certificación');
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(data.certificacionTexto, { align: 'justify' })
        .moveDown(1);
    }

    // Footer
    doc
      .moveDown(2)
      .fontSize(8)
      .font('Helvetica')
      .text('_'.repeat(60), { align: 'center' })
      .text('Firma del Aspirante', { align: 'center' })
      .moveDown(1);

    doc
      .fontSize(8)
      .text(
        'Este documento es generado automáticamente por el sistema de la Fundación L.A.M.A. Medellín.',
        { align: 'center', color: 'gray' }
      );

    doc.end();
    return stream;
  }

  /**
   * Agrega una sección con título al PDF.
   */
  private static addSection(doc: PDFKit.PDFDocument, title: string): void {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#333333')
      .text(title, { underline: true })
      .moveDown(0.5);
  }

  /**
   * Agrega un campo clave-valor al PDF.
   */
  private static addField(doc: PDFKit.PDFDocument, label: string, value: string): void {
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(`${label}: `, { continued: true })
      .font('Helvetica')
      .text(value)
      .moveDown(0.3);
  }
}
