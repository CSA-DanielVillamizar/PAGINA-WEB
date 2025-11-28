/**
 * Servicio de exportación a PDF del formulario de inscripción.
 * Separa la lógica de UI (Clean Architecture: capa de infraestructura/presentación).
 */
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface InscriptionData {
  fullName: string;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  departamentoNacimiento: string;
  ciudadNacimiento: string;
  tallaCamisa: string;
  tipoSangre: string;
  email?: string;
  fechaNacimiento?: string;
  licenciaCategoria?: string;
  vencLicencia?: string;
  vencSoat?: string;
  vencTecno?: string;
  fechaEmision?: Date;
}

/**
 * Exporta los datos a un PDF con maquetación básica.
 * TODO: Mejorar branding Adventure (logos, colores corporativos, fondos).
 */
export async function generateInscriptionPdf(
  data: InscriptionData,
  opts?: { logoDataUrl?: string; brandColor?: string; download?: boolean; fileName?: string }
) {
  const brand = opts?.brandColor || '#FFD200';
  const fileName = opts?.fileName || `Inscripcion_LAMA_${data.numeroIdentificacion || 'sin-id'}.pdf`;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'A4' });
  const fecha = data.fechaEmision || new Date();
  const fechaStr = fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });

  // Header de marca
  doc.setFillColor(brand);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 70, 'F');
  if (opts?.logoDataUrl) {
    try {
      doc.addImage(opts.logoDataUrl, 'PNG', 24, 12, 46, 46);
    } catch {}
  }
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#000000');
  doc.setFontSize(16);
  doc.text('FORMULARIO NACIONAL DE INSCRIPCIÓN - L.A.M.A. Medellín', 84, 30, { baseline: 'middle' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Emitido: ${fechaStr}`, 84, 52);

  // Tabla principal con estilos de marca
  (doc as any).autoTable({
    startY: 90,
    styles: { fontSize: 9 },
    headStyles: { fillColor: brand, textColor: 0 },
    head: [['Sección', 'Campo', 'Valor']],
    body: [
      ['DATOS PERSONALES', 'Nombre Completo', data.fullName],
      ['DATOS PERSONALES', 'Tipo Identificación', data.tipoIdentificacion],
      ['DATOS PERSONALES', 'Número Identificación', data.numeroIdentificacion],
      ['DATOS PERSONALES', 'Departamento Nacimiento', data.departamentoNacimiento],
      ['DATOS PERSONALES', 'Ciudad Nacimiento', data.ciudadNacimiento],
      ['DATOS PERSONALES', 'Fecha Nacimiento', data.fechaNacimiento || ''],
      ['DATOS PERSONALES', 'Talla Camisa/Chaleco', data.tallaCamisa],
      ['DATOS PERSONALES', 'Tipo Sangre', data.tipoSangre],
      ['DATOS PERSONALES', 'Correo', data.email || ''],
      ['LICENCIA / DOCUMENTOS', 'Categoría Licencia', data.licenciaCategoria || ''],
      ['LICENCIA / DOCUMENTOS', 'Vencimiento Licencia', data.vencLicencia || ''],
      ['LICENCIA / DOCUMENTOS', 'Vencimiento SOAT', data.vencSoat || ''],
      ['LICENCIA / DOCUMENTOS', 'Vencimiento Tecno-mecánica', data.vencTecno || '']
    ]
  });

  // Firma
  const afterTableY = (doc as any).lastAutoTable.finalY + 30;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#111111');
  doc.text('CERTIFICACIÓN Y FIRMA', 40, afterTableY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const firmaY = afterTableY + 24;
  doc.text(`Firma (Nombre): ${data.fullName}`, 40, firmaY);
  doc.text(`Cédula: ${data.numeroIdentificacion}`, 40, firmaY + 14);
  doc.text(`Fecha: ${fechaStr}`, 40, firmaY + 28);
  doc.text('Declaración: Acepto estatutos, reglamentos y exoneración de responsabilidad de L.A.M.A. Medellín.', 40, firmaY + 46, { maxWidth: 520 });

  if (opts?.download) {
    doc.save(fileName);
  }

  const arrayBuffer = doc.output('arraybuffer') as ArrayBuffer;
  const pdfBytes = new Uint8Array(arrayBuffer);
  // Base64
  let base64 = '';
  try {
    base64 = btoa(String.fromCharCode.apply(null, Array.from(pdfBytes) as unknown as number[]));
  } catch {}
  return { fileName, pdfBytes, base64 };
}

export async function exportInscriptionPdf(data: InscriptionData, options?: { logoDataUrl?: string }) {
  await generateInscriptionPdf(data, { logoDataUrl: options?.logoDataUrl, brandColor: '#FFD200', download: true });
}
