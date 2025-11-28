# 🏍 Sistema Completo de Eventos L.A.M.A. Medellín

## ✅ IMPLEMENTACIÓN COMPLETA

**Fecha:** Noviembre 27, 2025  
**Estado:** ✅ COMPLETADO - Listo para despliegue

---

## 📋 Resumen Ejecutivo

Sistema completo de gestión de eventos para la Fundación L.A.M.A. Medellín que incluye:

- ✅ Calendario interactivo (vista mensual + vista lista)
- ✅ Página de detalle con inscripciones
- ✅ Botones "Agregar a mi calendario" (Google, Outlook, iCal, Yahoo)
- ✅ Sistema de inscripción de miembros
- ✅ CRUD admin completo (protegido por roles)
- ✅ **Ranking deportivo oficial** con puntos, medallas y kilometraje

---

## 🏗 Arquitectura Implementada

### Backend (NestJS + TypeORM + PostgreSQL)

#### 1. Entidades

**Event** (`backend/src/modules/events/entities/event.entity.ts`)
- 14 campos completos
- Enums: `EventType`, `EventDifficulty`, `EventStatus`
- Relación OneToMany con `EventParticipant`
- Tipos de eventos: RODADA, ASAMBLEA, ANIVERSARIO, RALLY_NACIONAL, RALLY_REGIONAL, RALLY_SUDAMERICANO, RALLY_INTERNACIONAL, LAMA_HIERRO, EVENTO_SOCIAL, RUTA_ICONICA, OTRO

**EventParticipant** (`backend/src/modules/events/entities/event-participant.entity.ts`)
- Registra participación de miembros
- Estados: REGISTRADO, CONFIRMADO, ASISTIO, NO_ASISTIO
- Fuente: WEB, APP, ADMIN
- Relación ManyToOne con Event y User

#### 2. DTOs

- `CreateEventDto`: Validación completa con class-validator
- `UpdateEventDto`: PartialType para actualizaciones opcionales
- `RegisterEventDto`: Inscripción con notas opcionales
- `UpdateParticipantStatusDto`: Para marcar asistencia (admin)

#### 3. Reglas de Negocio

**EventPointsRules** (`backend/src/modules/events/rules/event-points.rules.ts`)

| Tipo Actividad          | Puntos |
|------------------------|--------|
| Rodada                 | 1      |
| Aniversario            | 1      |
| Evento Social          | 2      |
| Rally Regional         | 3      |
| Rally Nacional         | 5      |
| Rally Sudamericano     | 10     |
| Ruta Icónica           | 10     |
| Rally Internacional    | 15     |
| L.A.M.A. de Hierro     | 10     |
| Asamblea               | 0      |

**Medallas:**
- 🥉 Bronce: 5+ puntos
- 🥈 Plata: 15+ puntos
- 🥇 Oro: 30+ puntos
- 🏆 Rider de Hierro: 50+ puntos

**Desempate:** Por kilometraje acumulado

#### 4. Service

**EventsService** (`backend/src/modules/events/events.service.ts`)

Métodos principales:
- `create()`: Crear evento (validación slug único)
- `findAll(filters)`: Listar con filtros (tipo, estado, fecha)
- `findOne(id)`: Obtener por ID con participantes
- `findBySlug(slug)`: Para URLs amigables
- `update()`: Actualizar evento
- `remove()`: Eliminar evento
- `registerParticipant()`: Inscripción con validaciones
- `cancelRegistration()`: Cancelar inscripción
- `updateParticipantStatus()`: Marcar asistencia (admin)
- `getEventParticipants()`: Lista de inscritos
- `isUserRegistered()`: Verificar inscripción
- `getEventStats()`: Estadísticas del evento
- **`getRankingAnual(year)`**: Ranking completo con puntos + km
- **`getMemberStats(userId, year)`**: Estadísticas individuales

#### 5. Controller

**EventsController** (`backend/src/modules/events/events.controller.ts`)

**Rutas Públicas (GET):**
- `GET /events` - Listar todos (con filtros)
- `GET /events/slug/:slug` - Por slug
- `GET /events/:id` - Por ID
- `GET /events/:id/participantes` - Lista de inscritos
- `GET /events/:id/stats` - Estadísticas
- `GET /events/ranking/asistencia?year=YYYY` - **Ranking público**

**Rutas Protegidas (requieren JWT):**
- `POST /events/:id/inscribirse` - Inscribirse (cualquier miembro)
- `DELETE /events/:id/cancelar-inscripcion` - Cancelar inscripción
- `GET /events/:id/mi-inscripcion` - Verificar mi registro
- `GET /events/ranking/mis-estadisticas?year=YYYY` - Mis stats

**Rutas Admin (Junta + MTO + Negocios):**
- `POST /events` - Crear evento
- `PUT /events/:id` - Actualizar evento
- `DELETE /events/:id` - Eliminar (solo Presidente/Vice/Admin)
- `PUT /events/participantes/estado` - Marcar asistencia

#### 6. Migración

**1700000011000-EventsSystem.ts**
- Crea tabla `events` con 14 columnas
- Crea tabla `event_participants` con foreign keys
- Índices optimizados: slug, tipo, estado, fecha
- Índice único: (eventId, userId) para prevenir duplicados
- Reversible con `down()`

---

### Frontend (Next.js 14 App Router + TailwindCSS + shadcn/ui)

#### 1. Tipos TypeScript

**`lib/types/event.types.ts`**
- Interfaces completas para Event, EventParticipant
- Enums sincronizados con backend
- Tipos para RankingEntry y MemberStats

#### 2. Cliente API

**`lib/api/events.api.ts`**
- Wrapper de axios para todos los endpoints
- Tipado completo con TypeScript
- Manejo de errores centralizado

#### 3. Páginas Públicas

**`/eventos` (app/eventos/page.tsx)**
- Vista calendario mensual (grid 7x7)
- Vista lista alternativa
- Filtros por fecha
- Navegación mes anterior/siguiente
- Cards con tipo, fecha, destino, km
- Click → navega a detalle

**`/eventos/[slug]` (app/eventos/[slug]/page.tsx)**
- Hero section con imagen y título
- Descripción completa del evento
- Detalles: dificultad, duración, horas, punto encuentro, organizador, km
- **Botones "Agregar a mi calendario":**
  - Google Calendar (URL API)
  - Outlook/iCal (descarga .ics)
  - Yahoo Calendar
- **Botón "Quiero Participar":**
  - Redirige a login si no autenticado
  - Valida que evento esté publicado y sea futuro
  - Muestra "Ya estás inscrito" si aplica
- **Compartir:** Twitter, Facebook, WhatsApp
- Link a términos y condiciones
- Lista de participantes registrados

#### 4. Panel Admin

**`/admin/eventos` (app/admin/eventos/page.tsx)**
- Tabla con todos los eventos
- Filtros por tipo y estado
- Acciones: Editar, Eliminar
- **Modal de formulario:**
  - Todos los campos del evento
  - Auto-generación de slug desde título
  - Validación inline
  - Modo crear/editar

**`/admin/ranking-asistencia` (app/admin/ranking-asistencia/page.tsx)**
- Selector de año
- **Reglas de puntuación oficiales** (card destacado)
- **Sistema de medallas** visual
- Tabla de ranking:
  - Posición (badge dorado/plata/bronce para top 3)
  - Nombre del rider
  - Total eventos
  - **Puntos acumulados** (destacado)
  - **Km total** (para desempate)
  - Medalla con icono y color
- Orden: puntos DESC, km DESC
- Animaciones suaves con Framer Motion

---

## 🎨 UX/UI - Tema Adventure

### Paleta de Colores

- **Amarillo institucional:** `#FFD200`
- **Fondo:** `bg-gray-900` (oscuro permanente)
- **Cards:** `bg-gray-800` con bordes `border-gray-700`
- **Acentos:** Glow suave en amarillo para hover
- **Badges tipo evento:** Colores específicos (rodada amarillo, rally rojo, etc.)

### Animaciones

- Framer Motion en todas las páginas
- Progressive delays para tablas/listas
- Hover states suaves
- Pulse animation en medalla "Rider de Hierro"

### Componentes

- Formularios con React Hook Form
- shadcn/ui: badges, buttons, inputs, select, textarea
- Iconos: lucide-react (Calendar, MapPin, Trophy, etc.)
- Date formatting: date-fns con locale español

---

## 📡 Flujo de Usuario

### 1. Usuario No Autenticado

1. Visita `/eventos` → Ve calendario público
2. Click en evento → `/eventos/[slug]`
3. Lee detalle completo
4. Click "Quiero Participar" → Redirige a `/auth/login?redirect=/eventos/[slug]&reason=login_required`
5. Login exitoso → Vuelve al evento
6. Inscripción registrada ✅

### 2. Miembro del Capítulo

1. Login previo
2. Visita `/eventos`
3. Selecciona evento
4. Click "Quiero Participar"
5. Backend valida:
   - Usuario autenticado ✅
   - Evento publicado ✅
   - Evento futuro ✅
   - No inscrito previamente ✅
6. Crea `EventParticipant` con estado REGISTRADO
7. UI muestra "Ya estás inscrito" + botón cancelar

### 3. Rol Junta/Admin

1. Login con rol especial
2. Acceso a `/admin/eventos`
3. CRUD completo:
   - Crear eventos con formulario modal
   - Editar cualquier campo
   - Eliminar (solo Presidente/Vice/Admin)
4. Acceso a `/admin/ranking-asistencia`
5. Marcar asistencia de participantes (actualiza estado a ASISTIO)
6. Sistema calcula puntos automáticamente

### 4. Post-Evento

1. Admin marca asistencia (estado ASISTIO)
2. Backend suma puntos según tipo de evento
3. Backend acumula kilometraje
4. Ranking se actualiza automáticamente
5. Medallas se asignan por umbrales
6. Desempate por km

---

## 🔒 Seguridad

### Roles con Acceso

**Crear/Editar Eventos:**
- Presidente
- Vicepresidente
- Secretario
- Tesorero
- MTO
- Negocios
- Admin

**Eliminar Eventos:**
- Presidente
- Vicepresidente
- Admin

**Marcar Asistencia:**
- Todos los anteriores

**Inscribirse:**
- Cualquier miembro autenticado del capítulo

### Validaciones Backend

- JWT obligatorio para rutas protegidas
- Guards: `JwtAuthGuard` + `RolesGuard`
- Decorator `@Roles()` para autorización
- Validación de slug único
- Validación de fecha futura para inscripción
- Validación de evento publicado
- Prevención de inscripciones duplicadas (índice único DB)

---

## 📊 Reglas de Puntuación (Oficiales)

### Por Asistencia Confirmada

Solo se suman puntos cuando `EventParticipant.estado = 'ASISTIO'`

| Tipo                    | Puntos | Relevancia           |
|------------------------|--------|----------------------|
| Rodada                 | 1      | Local                |
| Aniversario            | 1      | Celebración          |
| Evento Social          | 2      | Comunitario          |
| Rally Regional         | 3      | Departamental        |
| Rally Nacional         | 5      | País                 |
| Rally Sudamericano     | 10     | Continental          |
| Ruta Icónica           | 10     | Especial             |
| Rally Internacional    | 15     | Global               |
| L.A.M.A. de Hierro     | 10     | Prueba de resistencia|

### Kilometraje

- Campo `kilometraje` en Event (obligatorio, int)
- Se acumula por cada evento con estado ASISTIO
- Sirve como criterio de desempate

### Medallas Automáticas

```typescript
if (totalPuntos >= 50) → 🏆 Rider de Hierro (#FFD700)
else if (totalPuntos >= 30) → 🥇 Oro (#FFD700)
else if (totalPuntos >= 15) → 🥈 Plata (#C0C0C0)
else if (totalPuntos >= 5) → 🥉 Bronce (#CD7F32)
else → — (sin medalla)
```

---

## 🚀 Despliegue

### Backend

1. **Ejecutar migración:**
   ```bash
   cd backend
   npm run migration:run
   ```

2. **Verificar tablas creadas:**
   - `events`
   - `event_participants`

3. **Seed de datos (opcional):**
   - Crear eventos de ejemplo vía admin panel
   - O insertar directamente en DB

### Frontend

1. **Variables de entorno:**
   ```env
   NEXT_PUBLIC_API_URL=https://api.lamamedellin.org
   ```

2. **Build:**
   ```bash
   cd frontend-next
   npm run build
   npm start
   ```

3. **Verificar rutas:**
   - `/eventos` ✅
   - `/eventos/[slug]` ✅
   - `/admin/eventos` ✅ (protegida)
   - `/admin/ranking-asistencia` ✅ (protegida)

---

## 📝 Casos de Uso Reales

### Ejemplo 1: Rodada Nocturna

**Admin crea:**
- Título: "NIGHT TRIP: MEDELLÍN – NOCHE DE TEJO"
- Tipo: RODADA
- Fecha: 2025-11-27 19:00
- Destino: Llano Grande
- Punto encuentro: EDS Texaco Palmas
- Kilometraje: 50 km
- Estado: PUBLICADO

**Miembros:**
- Ven en calendario (vista mes)
- Entran a detalle
- Agregan a su Google Calendar
- Hacen clic "Quiero Participar"
- Sistema registra inscripción

**Post-evento:**
- Admin marca asistencia de 25 miembros
- Cada uno suma **1 punto** + **50 km**

### Ejemplo 2: Rally Nacional

**Admin crea:**
- Título: "Rally Nacional L.A.M.A. 2025"
- Tipo: RALLY_NACIONAL
- Kilometraje: 800 km
- Estado: PUBLICADO

**Participación:**
- 50 miembros se inscriben
- 40 asisten realmente

**Resultado:**
- 40 riders suman **5 puntos** cada uno
- 40 riders suman **800 km** cada uno
- Top 3 del ranking se disputa por estos puntos

### Ejemplo 3: L.A.M.A. de Hierro

**Admin crea:**
- Título: "L.A.M.A. de Hierro - Prueba de Resistencia"
- Tipo: LAMA_HIERRO
- Kilometraje: 1500 km
- Dificultad: ALTA
- Duración: 72 horas

**Resultado:**
- Solo 10 riders completan
- Cada uno suma **10 puntos** + **1500 km**
- Estos riders escalan rápidamente en el ranking
- Varios alcanzan medalla 🏆 Rider de Hierro

---

## 🎯 KPIs y Métricas

### Admin Dashboard (Posible Extensión)

- Total eventos creados
- Total participantes únicos
- Promedio asistencia por evento
- Top 5 eventos más populares
- Tasa de conversión inscripción → asistencia
- Kilometraje total capítulo (anual)
- Distribución de medallas

### Ranking Insights

- Rider #1 del año
- Rider más consistente (más eventos con menos puntos)
- Rider con más km acumulados
- Rider "Revelación" (mayor crecimiento trimestral)

---

## 🔧 Mantenimiento

### Actualizar Reglas de Puntos

Editar: `backend/src/modules/events/rules/event-points.rules.ts`

```typescript
private static readonly POINTS_MAP: Record<EventType, number> = {
  [EventType.NUEVO_TIPO]: 8, // Agregar nuevo tipo
  // ...
};
```

### Agregar Nuevo Tipo de Evento

1. Backend:
   - Agregar en enum `EventType` (entity)
   - Agregar en `POINTS_MAP` (rules)
   - Ejecutar migración si se modifica enum en DB

2. Frontend:
   - Agregar en tipo TypeScript
   - Agregar label en `getEventTypeLabel()`
   - Agregar color en `getEventTypeColor()`

### Ajustar Umbrales de Medallas

Editar: `backend/src/modules/events/rules/event-points.rules.ts`

```typescript
static getMedal(totalPuntos: number): string {
  if (totalPuntos >= 100) return '🏆 Rider Legendario'; // Nuevo
  if (totalPuntos >= 50) return '🏆 Rider de Hierro';
  // ...
}
```

---

## ✅ Checklist de Calidad

- [x] Clean Architecture: Entity → Service → Controller → Module
- [x] RBAC completo con guards
- [x] Validación de DTOs con class-validator
- [x] Relaciones TypeORM OneToMany/ManyToOne
- [x] Índices optimizados en DB
- [x] Endpoints RESTful bien diseñados
- [x] Tipado completo en frontend (TypeScript)
- [x] Cliente API centralizado
- [x] Manejo de errores con try-catch + alerts
- [x] UX responsive (mobile-first)
- [x] Animaciones suaves (Framer Motion)
- [x] Tema oscuro Adventure consistente
- [x] Documentación inline en español técnico
- [x] Sistema de puntos matemáticamente correcto
- [x] Prevención de inscripciones duplicadas
- [x] Validaciones de negocio (fecha, estado, rol)

---

## 🏍 Mensaje Final

> **"Somos más que una ruta. Somos un legado en movimiento."**

Este sistema no solo gestiona eventos, sino que **celebra cada kilómetro recorrido** y **reconoce el compromiso** de cada rider con la Fundación L.A.M.A. Medellín.

Cada medalla es un logro. Cada punto es un recuerdo. Cada evento es una historia.

**¡Rodemos juntos hacia el legado! 🏍💛**

---

## 📞 Soporte Técnico

**Desarrollado por:** GitHub Copilot + Claude Sonnet 4.5  
**Fecha:** Noviembre 27, 2025  
**Versión:** 1.0.0  
**Licencia:** Uso exclusivo Fundación L.A.M.A. Medellín

