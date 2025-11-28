# Documentación Técnica: InscriptionForm

## Descripción General
Formulario nacional de inscripción de L.A.M.A. Medellín implementado bajo principios de **Clean Architecture**. Separa la lógica de presentación, datos estáticos y utilidades de exportación.

## Arquitectura

### Capas
1. **Presentación (UI)**: `InscriptionForm.tsx` - Componentes React controlados con hooks locales.
2. **Datos**: `colombia.ts` - Catálogo estático de departamentos y municipios.
3. **Infraestructura**: `exportInscriptionPdf.ts` - Servicio de exportación PDF (jsPDF).

### Patrón de Diseño
- **Componentes controlados**: Estado manejado mediante `useState` para cada campo crítico.
- **Selects dependientes**: `useMemo` + función `obtenerCiudades` para filtrado dinámico departamento → ciudad.
- **Separación de responsabilidades**: Utilidades reutilizables (`Field`, `FieldSelect`, `FieldFile`) evitan código espagueti.

## Componentes Principales

### `InscriptionForm`
Formulario maestro con cinco secciones:
- **I. Datos Personales**: Identificación, lugar de nacimiento, contacto, foto.
- **II. Información Médica y Emergencia**: Tipo sangre, EPS, contacto emergencia.
- **III. Datos Familiares**: Pareja e hijos.
- **IV. Datos Vehículo y Documentación**: Moto, licencia, SOAT, tecno-mecánica.
- **V. Certificación y Exoneración**: Firma automática y fecha actual.

### Campos Destacados
- **Tipo Identificación**: Select con opciones (Cédula Ciudadanía, Pasaporte, Cédula Extranjería).
- **Departamento/Ciudad Nacimiento**: Selects en cascada; ciudad se habilita solo tras seleccionar departamento.
- **Tipo Sangre**: Select con 8 opciones completas (A+, A-, B+, B-, AB+, AB-, O+, O-).
- **Talla Camisa**: Select con 9 tallas (XS–XXXXXL).
- **Año Moto**: Select dinámico con últimos 60 años.
- **Categoría Licencia**: Select con clases A1, A2, B1–B3, C1–C3.
- **Fecha**: Inputs `type="date"` para selector calendario nativo.
- **Fotografía**: Input file con vista previa Base64.

### Autocompletar Sección V
- **Firma del Solicitante**: Auto-rellenada con `fullName` (I. Datos Personales).
- **Cédula**: Auto-rellenada con `numeroIdentificacion`.
- **Día/Mes/Año**: Fecha actual obtenida con `useMemo(() => new Date(), [])`.

## Exportación PDF

### Función `exportInscriptionPdf`
Ubicación: `frontend/src/tools/exportInscriptionPdf.ts`

**Responsabilidades**:
- Genera PDF mediante jsPDF y jspdf-autotable.
- Tabla con campos principales (Nombre, Identificación, Departamento, Ciudad, Talla, Tipo Sangre, Licencia, Vencimientos).
- Sección de firma con nombre, cédula y fecha.
- Descarga automática con nombre `Inscripcion_LAMA_{numeroIdentificacion}.pdf`.

**Mejora futura**: Añadir logo L.A.M.A., colores corporativos Adventure (#FFD200), y layout más maquetado.

## Datos Colombia (`colombia.ts`)

### Estructura
```typescript
export interface DepartamentoColombia {
  codigo?: string;
  nombre: string;
  ciudades: string[];
}
```

### Contenido
- **32 departamentos** con lista completa de municipios oficiales.
- Ejemplo Antioquia: 125 municipios.
- Función auxiliar `obtenerCiudades(departamento: string): string[]`.

### Uso
```typescript
const ciudadesDisponibles = useMemo(() => obtenerCiudades(departamentoNacimiento), [departamentoNacimiento]);
```

## Flujo de Uso

1. **Carga inicial**: Usuario visualiza formulario con campos vacíos y fecha/firma de sección V auto-completada.
2. **Ingreso datos**: Completa secciones I–IV, con selects dependientes (depto → ciudad).
3. **Adjuntar foto**: Carga imagen (vista previa instantánea).
4. **Guardar Borrador** (futuro): Persistir en localStorage o backend.
5. **Enviar Solicitud**: 
   - Dispara `handleSubmit`.
   - Invoca `exportInscriptionPdf`.
   - Genera y descarga PDF maquetado.
   - (Futuro) POST a endpoint `/api/inscriptions`.

## Validaciones Pendientes

- **Required HTML5**: Campos con `required` atributo (nombre, email, tipo ID, número ID, etc.).
- **Lógica adicional**: Integrar `react-hook-form` para validaciones avanzadas (formato email, longitud cédula, fechas coherentes).
- **Mensajes de error**: Toast o banner con feedback.

## Dependencias

```json
{
  "framer-motion": "^11.18.2",
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.5.32"
}
```

## Estilos Adventure

Clases Tailwind personalizadas aplicadas:
- `card-adventure`: Tarjetas con fondo oscuro, borde primary, sombra glow.
- `input-adventure`: Inputs con fondo secondary, borde primary, focus glow.
- `btn-adventure`: Botón amarillo con hover effect.
- `scrollbar-adventure`: Scrollbar estilizado (navegadores Webkit).

## Notas de Implementación

- **Evitar código espagueti**: Lógica de UI separada de datos (colombia.ts) y utilidades (exportInscriptionPdf.ts).
- **Documentación en español técnico**: Comentarios JSDoc en cada función y componente.
- **Extensibilidad**: Añadir nuevos campos requiere únicamente estado + componente Field/FieldSelect; sin tocar lógica core.

---
**Autor**: Implementación Clean Architecture L.A.M.A. Medellín  
**Última actualización**: 27 de noviembre de 2025
