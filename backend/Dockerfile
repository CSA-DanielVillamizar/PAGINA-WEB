# Dockerfile multi-stage para backend NestJS
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias (incluye devDependencies para compilar)
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY src ./src

# Compilar TypeScript a JavaScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --legacy-peer-deps --omit=dev

# Copiar archivos compilados desde builder
COPY --from=builder /app/dist ./dist

# Exponer puerto (configurable via PORT env)
EXPOSE 3000

# Usuario no root para seguridad
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

# Comando de inicio
CMD ["node", "dist/main.js"]
