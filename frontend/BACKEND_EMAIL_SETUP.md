# Backend Email Setup - Formulario Inscripción L.A.M.A.

## Estado Actual
El formulario de inscripción (`frontend/src/pages/InscriptionForm.tsx`) tiene un **placeholder** para envío de email que requiere implementación backend.

### Código Frontend (líneas ~293-307)
```typescript
// TODO: Implementar endpoint backend real
const response = await fetch('/api/inscriptions/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName,
    email,
    numeroIdentificacion,
    tipoIdentificacion,
    departamentoNacimiento,
    ciudadNacimiento,
    tallaCamisa,
    // ... todos los campos del formulario
  })
});
```

---

## Requisitos Backend

### 1. Endpoint REST API
**URL**: `POST /api/inscriptions/send-email`  
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "fullName": "string",
  "email": "string (email válido)",
  "tipoIdentificacion": "CC | CE | PA | PPT",
  "numeroIdentificacion": "string",
  "departamentoNacimiento": "string",
  "ciudadNacimiento": "string",
  "fechaNacimiento": "YYYY-MM-DD",
  "tallaCamisa": "XS | S | M | L | XL | XXL | XXXL | XXXXL | XXXXXL",
  "tipoSangre": "A+ | A- | B+ | B- | AB+ | AB- | O+ | O-",
  "anioMoto": "number (1965-2025)",
  "licenciaCategoria": "A1 | A2 | B1 | B2 | B3 | C1 | C2 | C3",
  "vencLicencia": "YYYY-MM-DD",
  "vencSoat": "YYYY-MM-DD",
  "vencTecno": "YYYY-MM-DD",
  "tipoSangrePareja": "string (opcional)",
  "tieneHijos": "boolean",
  "hijos": [
    {
      "nombre": "string",
      "sexo": "M | F",
      "fechaNacimiento": "YYYY-MM-DD"
    }
  ],
  "aceptaEstatutos": "boolean (siempre true si llega aquí)"
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Solicitud de inscripción enviada exitosamente"
}
```

**Error Response** (400/500):
```json
{
  "success": false,
  "message": "Descripción del error"
}
```

---

### 2. Destinatario Email
**To**: `gerencia@fundacionlamamedellin.org`  
**Subject**: `Nueva Solicitud de Inscripción L.A.M.A. - {fullName}`  

**Contenido Sugerido**:
```
=== NUEVA SOLICITUD DE INSCRIPCIÓN L.A.M.A. MEDELLÍN ===

DATOS PERSONALES
- Nombre Completo: {fullName}
- Tipo ID: {tipoIdentificacion}
- Número ID: {numeroIdentificacion}
- Email: {email}
- Fecha Nacimiento: {fechaNacimiento}
- Lugar Nacimiento: {ciudadNacimiento}, {departamentoNacimiento}
- Talla Camisa: {tallaCamisa}
- Tipo Sangre: {tipoSangre}

DATOS MOTOCICLETA
- Año: {anioMoto}
- Licencia Categoría: {licenciaCategoria}
- Vencimiento Licencia: {vencLicencia}
- Vencimiento SOAT: {vencSoat}
- Vencimiento Tecnomecánica: {vencTecno}

INFORMACIÓN PAREJA
- Tipo Sangre Pareja: {tipoSangrePareja || 'N/A'}

INFORMACIÓN HIJOS
{tieneHijos ? hijos.map(h => `- ${h.nombre} (${h.sexo}) - ${h.fechaNacimiento}`).join('\n') : 'Sin hijos'}

DECLARACIÓN
☑️ Acepta Estatutos Internacionales L.A.M.A.

---
Solicitud recibida: {new Date().toLocaleString('es-CO')}
```

---

## Implementación Sugerida

### Stack Recomendado
- **Framework**: Node.js + Express (ya usado en backend/)
- **Email Service**: 
  - Opción 1: Nodemailer (SMTP directo)
  - Opción 2: SendGrid API
  - Opción 3: AWS SES
  - Opción 4: Mailgun

### Ejemplo Nodemailer
```javascript
// backend/src/modules/inscriptions/inscriptions.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Controller('inscriptions')
export class InscriptionsController {
  @Post('send-email')
  async sendInscriptionEmail(@Body() data: InscriptionDto) {
    // Configurar transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Formatear contenido email
    const emailBody = `
=== NUEVA SOLICITUD DE INSCRIPCIÓN L.A.M.A. MEDELLÍN ===

DATOS PERSONALES
- Nombre Completo: ${data.fullName}
- Tipo ID: ${data.tipoIdentificacion}
- Número ID: ${data.numeroIdentificacion}
...
    `;

    // Enviar email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@fundacionlamamedellin.org',
      to: 'gerencia@fundacionlamamedellin.org',
      subject: `Nueva Solicitud de Inscripción L.A.M.A. - ${data.fullName}`,
      text: emailBody,
      html: emailBody.replace(/\n/g, '<br>')
    });

    return { success: true, message: 'Solicitud enviada exitosamente' };
  }
}
```

### Variables de Entorno
Añadir a `backend/.env`:
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM=noreply@fundacionlamamedellin.org
```

---

## Seguridad

### Validaciones Backend
- ✅ Validar formato email (regex)
- ✅ Validar tipoIdentificacion en enum permitido
- ✅ Validar fechas coherentes (fechaNacimiento > 1920, vencimientos > hoy)
- ✅ Validar tallas en lista permitida
- ✅ Validar tipos sangre en lista permitida
- ✅ Sanitizar strings (prevenir injection)
- ✅ Rate limiting (prevenir spam)

### CORS
Configurar backend para aceptar requests desde frontend:
```javascript
app.enableCors({
  origin: ['http://localhost:5173', 'https://fundacionlamamedellin.org'],
  credentials: true
});
```

---

## Testing

### Curl Manual
```bash
curl -X POST http://localhost:3000/api/inscriptions/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Juan Pérez",
    "email": "juan@example.com",
    "tipoIdentificacion": "CC",
    "numeroIdentificacion": "1234567890",
    "departamentoNacimiento": "Antioquia",
    "ciudadNacimiento": "Medellín",
    "fechaNacimiento": "1990-05-15",
    "tallaCamisa": "L",
    "tipoSangre": "O+",
    "anioMoto": 2020,
    "licenciaCategoria": "A2",
    "vencLicencia": "2025-12-31",
    "vencSoat": "2025-06-30",
    "vencTecno": "2025-06-30",
    "tieneHijos": false,
    "hijos": [],
    "aceptaEstatutos": true
  }'
```

### Postman Collection
Crear colección con:
- Request POST send-email
- Casos válidos e inválidos
- Verificar rate limiting

---

## Notas Implementación

### Adjunto PDF
El formulario frontend exporta PDF localmente (`exportInscriptionPdf.ts`), pero **NO** lo adjunta al email actualmente.

**Para adjuntar PDF**:
1. Frontend envía PDF como Base64 en request body:
   ```typescript
   body: JSON.stringify({
     ...formData,
     pdfBase64: await exportInscriptionPdfAsBase64(data)
   })
   ```
2. Backend decodifica y adjunta:
   ```javascript
   attachments: [{
     filename: `Inscripcion_${data.numeroIdentificacion}.pdf`,
     content: Buffer.from(data.pdfBase64, 'base64')
   }]
   ```

### Persistencia Opcional
Considerar guardar solicitudes en PostgreSQL:
```sql
CREATE TABLE inscriptions (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255),
  numero_identificacion VARCHAR(50) UNIQUE,
  -- ... todos los campos
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Checklist Implementación

- [ ] Crear módulo inscriptions en backend NestJS
- [ ] Instalar dependencias: `npm install nodemailer @types/nodemailer`
- [ ] Configurar variables entorno SMTP
- [ ] Implementar DTO InscriptionDto con validaciones
- [ ] Crear controller con endpoint POST /api/inscriptions/send-email
- [ ] Implementar lógica envío email con Nodemailer
- [ ] Configurar CORS para permitir requests desde frontend
- [ ] Añadir rate limiting (express-rate-limit)
- [ ] Testing manual con Postman/curl
- [ ] Actualizar frontend para manejar errores backend (try/catch)
- [ ] Opcional: Implementar adjunto PDF en email
- [ ] Opcional: Guardar solicitudes en base de datos
- [ ] Desplegar backend con variables entorno producción

---

## Contacto Soporte
Para dudas sobre implementación backend:
- Revisar backend NestJS existente en `backend/src/`
- Consultar documentación Nodemailer: https://nodemailer.com/
- Verificar configuración SMTP proveedor email
