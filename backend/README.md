# Backend - API NestJS

Stack: NestJS + TypeORM + PostgreSQL / Azure SQL + Azure Blob Storage

## Variables de entorno

Crear archivo `.env` en la raíz del backend:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_NAME=lama_db

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=your_connection_string

# Azure Communication Services (Email)
AZURE_COMMUNICATION_CONNECTION_STRING=your_connection_string

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173

# Server
PORT=3000
```

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run start:dev

# Producción
npm run build
npm start
```

## Swagger

Documentación interactiva de la API: `http://localhost:3000/api/docs`

## Seed inicial de roles

```bash
curl -X POST http://localhost:3000/api/roles/seed
```

Esto creará los roles: Presidente, Vicepresidente, Secretario, Tesorero, GerenciaNegocios, MTO, Administrador, CommunityManager, Miembro, Invitado.
