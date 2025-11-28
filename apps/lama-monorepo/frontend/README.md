# Frontend Next.js 14 – Fundación L.A.M.A. Medellín

Requisitos:
- Node.js 20+

Pasos iniciales:
1. Instala dependencias: `npm i`
2. Copia `.env.local.example` a `.env.local` y ajusta valores
3. Levanta en desarrollo: `npm run dev`
4. Build producción: `npm run build && npm start`

Estructura:
- app/: páginas con App Router de Next.js 14
- components/: componentes reutilizables (UI con shadcn/ui base)
- lib/: utilidades (cn, etc.)
- services/: cliente HTTP para backend
- store/: estado global con Zustand

Próximos pasos:
- Agregar más páginas públicas: sobre-nosotros, miembros, souvenirs, noticias, calendario, etc.
- Completar componentes UI (formularios, cards, tablas, modales)
- Conectar con backend para auth, CRUD de entidades, etc.
