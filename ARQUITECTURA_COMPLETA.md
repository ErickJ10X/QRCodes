# 🏗️ Arquitectura Completa: Sistema de Generación de QR Codes con NestJS

**Autor:** Sistema de Arquitectura Senior  
**Fecha:** Febrero 2026  
**Versión:** 1.0  
**Tecnología:** NestJS + PrismaORM + PostgreSQL + Redis + Docker

---

## 📋 Índice de Contenidos

1. [Visión General](#visión-general)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Arquitectura de Módulos](#arquitectura-de-módulos)
4. [Diseño de Base de Datos](#diseño-de-base-de-datos)
5. [Sistema de Autenticación](#sistema-de-autenticación)
6. [Flujos y Diagramas](#flujos-y-diagramas)
7. [Configuración de Infraestructura](#configuración-de-infraestructura)
8. [Archivos de Configuración](#archivos-de-configuración)
9. [Ejemplos de Código](#ejemplos-de-código)
10. [Plan de Implementación](#plan-de-implementación)
11. [Comandos de Inicialización](#comandos-de-inicialización)

---

## 🎯 Visión General

Este es un backend robusto, escalable y profesional para un sistema de generación y gestión de QR codes. La arquitectura sigue patrones de diseño enterprise reconocidos en la comunidad NestJS.

### Stack Tecnológico
- **Framework**: NestJS (arquitectura modular y escalable)
- **Base de Datos**: PostgreSQL (persistencia relacional)
- **ORM**: PrismaORM (type-safe y migraciones automatizadas)
- **Cache**: Redis (rendimiento y rate limiting)
- **Autenticación**: JWT (stateless, escalable)
- **Containerización**: Docker + Docker Compose
- **Logging**: Winston (logs estructurados)
- **Validación**: class-validator + class-transformer

### Principios Arquitectónicos
✅ **Modularidad**: Cada módulo es independiente y reutilizable  
✅ **Responsabilidad Única**: Controllers, Services, Repositories bien separados  
✅ **Inyección de Dependencias**: NestJS IoC container  
✅ **Escalabilidad**: Redis para cache y rate limiting horizontal  
✅ **Seguridad**: JWT, roles, rate limiting, validación en capas  
✅ **Observabilidad**: Logs estructurados y manejo de errores centralizado  

---

## 📁 Estructura de Carpetas

```
qr-code-generator/
├── src/
│   ├── common/                      # 🔧 Código compartido
│   │   ├── decorators/              # Decoradores personalizados
│   │   │   ├── is-admin.decorator.ts
│   │   │   ├── current-user.decorator.ts
│   │   │   └── rate-limit.decorator.ts
│   │   ├── filters/                 # Filtros globales de excepciones
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/                  # Guards de autenticación y autorización
│   │   │   ├── jwt.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── rate-limit.guard.ts
│   │   ├── interceptors/            # Interceptores para transformación
│   │   │   ├── transform.interceptor.ts
│   │   │   └── logging.interceptor.ts
│   │   ├── pipes/                   # Pipes personalizados
│   │   │   └── validation.pipe.ts
│   │   ├── middleware/              # Middlewares
│   │   │   └── logger.middleware.ts
│   │   ├── constants/               # Constantes de aplicación
│   │   │   ├── auth.constants.ts
│   │   │   ├── validation.constants.ts
│   │   │   └── error.constants.ts
│   │   ├── utils/                   # Funciones utilitarias
│   │   │   ├── hash.util.ts
│   │   │   ├── jwt.util.ts
│   │   │   └── logger.util.ts
│   │   ├── exceptions/              # Excepciones personalizadas
│   │   │   ├── app.exception.ts
│   │   │   ├── auth.exception.ts
│   │   │   └── qr.exception.ts
│   │   ├── types/                   # Tipos e interfaces globales
│   │   │   ├── request.types.ts
│   │   │   └── response.types.ts
│   │   ├── enums/                   # Enums globales
│   │   │   ├── user-role.enum.ts
│   │   │   └── qr-format.enum.ts
│   │   └── config/                  # Configuración centralizada
│   │       ├── database.config.ts
│   │       ├── redis.config.ts
│   │       ├── jwt.config.ts
│   │       └── app.config.ts
│   │
│   ├── modules/                     # 📦 Módulos de negocio
│   │   ├── auth/                    # Módulo de autenticación
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── register.dto.ts
│   │   │   │   ├── refresh-token.dto.ts
│   │   │   │   └── auth-response.dto.ts
│   │   │   └── interfaces/
│   │   │       └── jwt-payload.interface.ts
│   │   │
│   │   ├── users/                   # Módulo de usuarios
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.module.ts
│   │   │   ├── repositories/
│   │   │   │   └── users.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   ├── update-user.dto.ts
│   │   │   │   └── user-response.dto.ts
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   │
│   │   ├── qr-codes/                # Módulo principal de QR codes
│   │   │   ├── qr-codes.controller.ts
│   │   │   ├── qr-codes.service.ts
│   │   │   ├── qr-generator.service.ts
│   │   │   ├── qr-codes.module.ts
│   │   │   ├── repositories/
│   │   │   │   └── qr-codes.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-qr.dto.ts
│   │   │   │   ├── update-qr.dto.ts
│   │   │   │   ├── qr-response.dto.ts
│   │   │   │   └── qr-list.dto.ts
│   │   │   ├── entities/
│   │   │   │   └── qr-code.entity.ts
│   │   │   ├── enums/
│   │   │   │   ├── qr-format.enum.ts
│   │   │   │   └── qr-status.enum.ts
│   │   │   └── interfaces/
│   │   │       ├── qr-generation.interface.ts
│   │   │       └── qr-metadata.interface.ts
│   │   │
│   │   ├── analytics/               # Módulo de estadísticas
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── analytics.module.ts
│   │   │   ├── repositories/
│   │   │   │   └── analytics.repository.ts
│   │   │   └── dto/
│   │   │       └── analytics-response.dto.ts
│   │   │
│   │   ├── cache/                   # Módulo de cache
│   │   │   ├── cache.service.ts
│   │   │   ├── cache.module.ts
│   │   │   └── cache.constants.ts
│   │   │
│   │   └── health/                  # Módulo de health check
│   │       ├── health.controller.ts
│   │       ├── health.module.ts
│   │       └── indicators/
│   │           ├── database.indicator.ts
│   │           └── redis.indicator.ts
│   │
│   ├── app.module.ts                # Módulo raíz
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── main.ts                      # Punto de entrada
│   └── types/
│       └── express.d.ts             # Extensiones de tipos Express
│
├── prisma/                          # 🗄️ Gestión de BD
│   ├── schema.prisma
│   ├── seed.ts                      # Datos de prueba
│   └── migrations/                  # Historial de migraciones
│
├── test/                            # 🧪 Testing
│   ├── jest.config.ts
│   ├── auth.e2e.spec.ts
│   ├── qr-codes.e2e.spec.ts
│   └── fixtures/
│       └── test-data.ts
│
├── docker/                          # 🐳 Docker
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   └── entrypoint.sh
│
├── config/                          # ⚙️ Variables de entorno
│   ├── .env.example
│   ├── .env.development
│   ├── .env.test
│   └── .env.production
│
├── scripts/                         # 🚀 Scripts útiles
│   ├── init-db.sh
│   ├── seed-db.sh
│   └── migrate.sh
│
├── docs/                            # 📚 Documentación
│   ├── API.md
│   ├── TESTING.md
│   └── DEPLOYMENT.md
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

### 📝 Explicación de Estructura

**`src/common/`**: Código reutilizable en toda la aplicación
- Decoradores, Guards, Pipes, Filters para lógica transversal
- Configuración centralizada (DB, Redis, JWT)
- Excepciones y tipos compartidos

**`src/modules/`**: Modificación de negocio independientes
- Cada módulo es un dominio completo (Controller → Service → Repository)
- Encapsulación de DTOs y Entities
- Responsabilidades claras

**`prisma/`**: Gestión de datos y esquema
- Schema único como fuente de verdad
- Migraciones automáticas versionadas

**Separación por capas dentro cada módulo**:
- Controller: Solicitudes HTTP
- Service: Lógica de negocio
- Repository: Acceso a datos

---

## 🏛️ Arquitectura de Módulos

### 1️⃣ **AuthModule** - Autenticación y Autorización

**Responsabilidades:**
- Registro de usuarios
- Login y generación de JWT
- Refresh tokens
- Validación de credenciales
- Integración con JWT Strategy

**Dependencias:**
- UsersModule (para buscar usuarios)
- CacheModule (para gestionar tokens bloqueados)

**DTOs Principales:**
```typescript
// LoginDto
{
  email: string;
  password: string;
}

// RegisterDto
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole; // Controlado por Admin
}

// AuthResponseDto
{
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
  expiresIn: number;
}
```

### 2️⃣ **UsersModule** - Gestión de Usuarios

**Responsabilidades:**
- CRUD de usuarios
- Perfil del usuario actual
- Cambio de contraseña
- Asignación de roles (solo admin)
- Eliminación de usuarios

**DTOs Principales:**
```typescript
// CreateUserDto
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// UpdateUserDto (parcial)
{
  firstName?: string;
  lastName?: string;
  email?: string;
}

// UserResponseDto
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3️⃣ **QrCodesModule** - Generación y Gestión de QR

**Responsabilidades:**
- Crear nuevos QR codes
- Listar QR codes del usuario
- Obtener detalles de un QR
- Actualizar metadatos del QR
- Eliminar QR codes
- Descargar QR en diferentes formatos

**Servicios internos:**
- `QrCodesService`: Lógica de negocio
- `QrGeneratorService`: Generación física del QR
- `QrCodesRepository`: Acceso a datos

**DTOs Principales:**
```typescript
// CreateQrDto
{
  targetUrl: string;
  title: string;
  description?: string;
  format: QrFormat; // PNG, SVG
  size?: number; // pixels
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';
  tags?: string[];
}

// QrResponseDto
{
  id: string;
  userId: string;
  targetUrl: string;
  title: string;
  description?: string;
  format: QrFormat;
  qrData: string; // Base64 del QR generado
  status: QrStatus;
  scans: number;
  createdAt: Date;
  updatedAt: Date;
}

// QrListDto (paginado)
{
  data: QrResponseDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
```

### 4️⃣ **AnalyticsModule** - Estadísticas de Escaneo

**Responsabilidades:**
- Registrar escaneos de QR
- Obtener estadísticas por QR
- Dashboard de usuario
- Estadísticas globales (solo admin)

**DTOs Principales:**
```typescript
// RecordScanDto
{
  qrId: string;
  userAgent?: string;
  ipAddress?: string;
  referer?: string;
  timestamp: Date;
}

// QrAnalyticsDto
{
  qrId: string;
  totalScans: number;
  scansByDate: Array<{ date: string; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
  topDevices: Array<{ device: string; count: number }>;
  lastScanned?: Date;
}
```

### 5️⃣ **CacheModule** - Gestión de Cache

**Responsabilidades:**
- Almacenar QR codes frecuentes
- Caché de usuarios
- Gestión de sesiones de token
- TTL automático

**Métodos:**
- `get(key: string)`
- `set(key: string, value: any, ttl?: number)`
- `del(key: string)`
- `flush(pattern?: string)`

### 6️⃣ **HealthModule** - Monitoreo

**Responsabilidades:**
- Verificar salud de la BD
- Verificar salud de Redis
- Endpoint de healthcheck

---

## 🗄️ Diseño de Base de Datos

### Diagrama ER

```mermaid
erDiagram
    USER ||--o{ QR_CODE : creates
    USER ||--o{ REFRESH_TOKEN : has
    USER ||--o{ SCAN_LOG : generates
    QR_CODE ||--o{ QR_METADATA : contains
    QR_CODE ||--o{ SCAN_LOG : receives
    QR_CODE ||--o{ QR_STATISTIC : tracks

    USER {
        string id PK
        string email UK
        string password
        string firstName
        string lastName
        string role "admin|user"
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    REFRESH_TOKEN {
        string id PK
        string userId FK
        string token
        datetime expiresAt
        boolean isRevoked
        datetime createdAt
    }

    QR_CODE {
        string id PK
        string userId FK
        string targetUrl
        string title
        string description
        string format "PNG|SVG"
        text qrData "Base64"
        string status "active|archived"
        int scans "contador"
        datetime createdAt
        datetime updatedAt
    }

    QR_METADATA {
        string id PK
        string qrId FK
        string key
        string value
        datetime createdAt
    }

    SCAN_LOG {
        string id PK
        string qrId FK
        string userId FK
        string ipAddress
        string userAgent
        string country
        string device
        datetime scannedAt
    }

    QR_STATISTIC {
        string id PK
        string qrId FK
        datetime date
        int scanCount
        string topCountry
        string topDevice
    }
```

### Schema Prisma Completo

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ============================================================================
// USUARIOS
// ============================================================================

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String
  firstName     String
  lastName      String
  role          UserRole @default(USER)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relaciones
  qrCodes       QrCode[]
  refreshTokens RefreshToken[]
  scans         ScanLog[]

  @@index([email])
  @@index([role])
  @@map("users")
}

enum UserRole {
  ADMIN
  USER

  @@map("user_role")
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  isRevoked Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}

// ============================================================================
// QR CODES
// ============================================================================

model QrCode {
  id            String   @id @default(cuid())
  userId        String
  targetUrl     String
  title         String
  description   String?
  format        QrFormat @default(PNG)
  qrData        String   @db.Text
  status        QrStatus @default(ACTIVE)
  scans         Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relaciones
  user          User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  metadata      QrMetadata[]
  scanLogs      ScanLog[]
  statistics    QrStatistic[]

  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("qr_codes")
}

enum QrFormat {
  PNG
  SVG

  @@map("qr_format")
}

enum QrStatus {
  ACTIVE
  ARCHIVED
  DELETED

  @@map("qr_status")
}

model QrMetadata {
  id        String   @id @default(cuid())
  qrId      String
  key       String
  value     String
  createdAt DateTime @default(now())

  qrCode    QrCode   @relation(fields: [qrId], references: [id], onDelete: Cascade)

  @@unique([qrId, key])
  @@index([qrId])
  @@map("qr_metadata")
}

// ============================================================================
// ESCANEOS Y ESTADÍSTICAS
// ============================================================================

model ScanLog {
  id        String   @id @default(cuid())
  qrId      String
  userId    String?  // nullable para scans anónimos
  ipAddress String?
  userAgent String?
  country   String?
  device    String?
  scannedAt DateTime @default(now())

  qrCode    QrCode   @relation(fields: [qrId], references: [id], onDelete: Cascade)
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([qrId])
  @@index([userId])
  @@index([scannedAt])
  @@map("scan_logs")
}

model QrStatistic {
  id        String   @id @default(cuid())
  qrId      String
  date      DateTime
  scanCount Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  qrCode    QrCode   @relation(fields: [qrId], references: [id], onDelete: Cascade)

  @@unique([qrId, date])
  @@index([qrId])
  @@index([date])
  @@map("qr_statistics")
}

// ============================================================================
// AUDITORÍA Y LOGGING (OPCIONAL pero recomendado)
// ============================================================================

model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String
  entity    String
  entityId  String
  changes   String   @db.Json
  timestamp DateTime @default(now())

  @@index([userId])
  @@index([entity])
  @@index([timestamp])
  @@map("audit_logs")
}
```

### Índices de BD Recomendados

```sql
-- Ya definidos en schema, pero para referencia:

-- Búsqueda frecuente de usuarios por email
CREATE INDEX idx_users_email ON users(email);

-- Filtrado de QR codes por usuario
CREATE INDEX idx_qr_codes_user_id ON qr_codes(user_id);

-- Filtrado de QR codes por estado
CREATE INDEX idx_qr_codes_status ON qr_codes(status);

-- Búsqueda de tokens refresh
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- Consultas de escaneos por QR
CREATE INDEX idx_scan_logs_qr_id ON scan_logs(qr_id);
CREATE INDEX idx_scan_logs_user_id ON scan_logs(user_id);
CREATE INDEX idx_scan_logs_scanned_at ON scan_logs(scanned_at);

-- Dashboard de estadísticas
CREATE INDEX idx_qr_statistics_qr_id ON qr_statistics(qr_id);
CREATE INDEX idx_qr_statistics_date ON qr_statistics(date);
```

---

## 🔐 Sistema de Autenticación

### Flujo Completo de Autenticación

```mermaid
graph TD
    A[Usuario envía credentials] -->|POST /auth/login| B[AuthController]
    B --> C[AuthService.login]
    C --> D[UsersService.findByEmail]
    D --> E{Usuario existe?}
    E -->|No| F[AuthException]
    E -->|Sí| G[Validar contraseña]
    G --> H{Contraseña válida?}
    H -->|No| F
    H -->|Sí| I[Generar JWT access token]
    I --> J[Generar Refresh Token]
    J --> K[Guardar refresh token en BD]
    K --> L[Guardar en Redis con TTL]
    L --> M[Retornar tokens al usuario]
    
    M --> N[Usuario almacena tokens]
    N -->|Next request con Bearer token| O[JwtGuard]
    O --> P{Token válido?}
    P -->|No| Q[UnauthorizedException]
    P -->|Sí| R[JwtStrategy verifica signature]
    R --> S{Token expirado?}
    S -->|Sí| T[Usuario envía refresh token]
    S -->|No| U[Permite acceso a recurso]
    T --> V[AuthService.refreshToken]
    V --> W[Validar refresh token en BD]
    W --> X{Token válido?}
    X -->|No| Q
    X -->|Sí| Y[Generar nuevo access token]
    Y --> Z[Retornar nuevo token]
```

### Guard de Autenticación JWT

```typescript
// src/common/guards/jwt.guard.ts

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context) {
    // Implementación custom si es necesario
    return super.canActivate(context);
  }
}
```

### Guard de Roles

```typescript
// src/common/guards/roles.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@common/enums/user-role.enum';
import { ROLES_KEY } from '@common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No hay restricción de roles
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a este recurso',
      );
    }

    return true;
  }
}
```

### Decorator de Roles

```typescript
// src/common/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@common/enums/user-role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

### JWT Strategy

```typescript
// src/modules/auth/strategies/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { UsersService } from '@modules/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no válido o inactivo');
    }

    return user;
  }
}
```

### Local Strategy (Opcional)

```typescript
// src/modules/auth/strategies/local.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return user;
  }
}
```

### Definición de JWT Payload

```typescript
// src/modules/auth/interfaces/jwt-payload.interface.ts

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
  iat: number; // issued at
  exp: number; // expiration
}
```

### Decorator CurrentUser

```typescript
// src/common/decorators/current-user.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### Flujo de Refresh Token

```typescript
// En auth.service.ts

async refreshToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  // 1. Validar que el token existe en BD y no está revocado
  const storedToken = await this.prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken || storedToken.isRevoked) {
    throw new UnauthorizedException('Refresh token inválido o revocado');
  }

  // 2. Verificar que no ha expirado
  if (new Date() > storedToken.expiresAt) {
    throw new UnauthorizedException('Refresh token expirado');
  }

  // 3. Extraer usuario
  const user = await this.usersService.findById(storedToken.userId);

  // 4. Generar nuevos tokens
  const { accessToken, expiresIn } = this.generateAccessToken(user);
  const { token: newRefreshToken, expiresAt } =
    await this.generateRefreshToken(user.id);

  // 5. Revocar token anterior (opcional pero recomendado)
  await this.prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { isRevoked: true },
  });

  // 6. Guardar nuevo token en cache
  await this.cacheService.set(
    `refresh_token:${newRefreshToken}`,
    user.id,
    7 * 24 * 60 * 60, // 7 días
  );

  return {
    accessToken,
    refreshToken: newRefreshToken,
    expiresIn,
  };
}
```

---

## 📊 Flujos y Diagramas

### Flujo de Creación de QR Code

```mermaid
graph TD
    A[Cliente envía request] -->|POST /qr-codes| B[QrCodesController]
    B -->|@JwtAuthGuard| C{Usuario autenticado?}
    C -->|No| D[UnauthorizedException]
    C -->|Sí| E[QrCodesService.create]
    E --> F[Validar URL]
    F --> G{URL válida?}
    G -->|No| H[BadRequestException]
    G -->|Sí| I[QrGeneratorService.generate]
    I --> J[Generar QR como PNG/SVG]
    J --> K[Convertir a Base64]
    K --> L[QrCodesRepository.create]
    L --> M[Guardar en BD]
    M --> N[Guardar en Cache Redis]
    N --> O[Retornar QrResponseDto]
    
    style D fill:#ff6b6b
    style H fill:#ff6b6b
```

### Flujo de Rate Limiting

```mermaid
graph TD
    A[Request entrante] --> B[RateLimitInterceptor]
    B --> C{Obtener limit de Redis}
    C --> D[Key: rate_limit:userId:endpoint]
    D --> E{Contador < límite?}
    E -->|No| F[TooManyRequestsException]
    E -->|Sí| G[Incrementar contador]
    G --> H[Continuar request]
    H --> I[Procesar lógica]
    I --> J[Responder al cliente]
    
    style F fill:#ff6b6b
```

### Flujo de Caché

```mermaid
graph TD
    A[QrCodesService.getById] --> B[Verificar Cache]
    B --> C{Existe en Redis?}
    C -->|Sí| D[Retornar del cache]
    C -->|No| E[Consultar BD]
    E --> F[Guardar en cache con TTL]
    F --> G[Retornar al cliente]
    
    D --> H[Incrementar hit rate]
    
    style H fill:#51cf66
```

---

## 🐳 Configuración de Infraestructura

### Docker Compose Completo

```yaml
# docker-compose.yml

version: '3.8'

services:
  # ============================================================================
  # BASE DE DATOS PostgreSQL
  # ============================================================================
  postgres:
    image: postgres:15-alpine
    container_name: qr-postgres
    environment:
      POSTGRES_USER: ${DB_USER:-qrcode}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-qrcode_db}
      PGTZ: 'UTC'
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sh:/docker-entrypoint-initdb.d/init-db.sh
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USER:-qrcode}']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - qr-network
    restart: unless-stopped

  # ============================================================================
  # CACHE con Redis
  # ============================================================================
  redis:
    image: redis:7-alpine
    container_name: qr-redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-redis123}
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', '--raw', 'incr', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - qr-network
    restart: unless-stopped

  # ============================================================================
  # APLICACIÓN NestJS
  # ============================================================================
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile
    container_name: qr-app
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      # Base de datos
      DATABASE_URL: postgresql://${DB_USER:-qrcode}:${DB_PASSWORD:-postgres}@postgres:5432/${DB_NAME:-qrcode_db}
      
      # Redis
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD:-redis123}
      
      # JWT
      JWT_SECRET: ${JWT_SECRET:-your-secret-key-change-in-production}
      JWT_EXPIRATION: ${JWT_EXPIRATION:-3600}
      JWT_REFRESH_EXPIRATION: ${JWT_REFRESH_EXPIRATION:-604800}
      
      # Aplicación
      NODE_ENV: ${NODE_ENV:-development}
      PORT: ${PORT:-3000}
      APP_NAME: ${APP_NAME:-QR Code Generator}
      APP_VERSION: ${APP_VERSION:-1.0.0}
      
      # Logging
      LOG_LEVEL: ${LOG_LEVEL:-debug}
    ports:
      - "${PORT:-3000}:3000"
    volumes:
      - ./src:/app/src
      - ./prisma:/app/prisma
    networks:
      - qr-network
    restart: unless-stopped
    stdin_open: true
    tty: true

  # ============================================================================
  # pgAdmin para administración BD (OPCIONAL)
  # ============================================================================
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: qr-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_EMAIL:-admin@admin.com}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD:-admin}
    ports:
      - "${PGADMIN_PORT:-5050}:80"
    networks:
      - qr-network
    depends_on:
      - postgres
    restart: unless-stopped

  # ============================================================================
  # Redis Commander para visualizar Redis (OPCIONAL)
  # ============================================================================
  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: qr-redis-commander
    environment:
      - REDIS_HOSTS=local:redis:6379:0:${REDIS_PASSWORD:-redis123}
    ports:
      - "${REDIS_COMMANDER_PORT:-8081}:8081"
    networks:
      - qr-network
    depends_on:
      - redis
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  qr-network:
    driver: bridge
```

### Dockerfile Optimizado

```dockerfile
# docker/Dockerfile

# ============================================================================
# STAGE 1: Builder
# ============================================================================
FROM node:18-alpine as builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY src ./src
COPY prisma ./prisma
COPY .eslintrc.js .prettierrc ./

# Generar Prisma Client
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# ============================================================================
# STAGE 2: Runtime
# ============================================================================
FROM node:18-alpine

WORKDIR /app

# Instalar dumb-init para manejo correcto de señales
RUN apk add --no-cache dumb-init

# Copiar solo lo necesario del builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Ejecutar aplicación
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

### Dockerfile para Producción

```dockerfile
# docker/Dockerfile.prod
# Mismo que Dockerfile pero con optimizaciones adicionales

FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm ci --only=production && npm run build

FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

### Script de Inicialización BD

```bash
#!/bin/bash
# scripts/init-db.sh

set -e

echo "Inicializando base de datos..."

# Las migraciones de Prisma se ejecutarán desde la app
# Este script puede ejecutar scripts SQL si es necesario

echo "Base de datos lista"
```

---

## ⚙️ Archivos de Configuración

### .env.example

```env
# ============================================================================
# SERVIDOR
# ============================================================================
NODE_ENV=development
PORT=3000
APP_NAME=QR Code Generator
APP_VERSION=1.0.0

# ============================================================================
# BASE DE DATOS - PostgreSQL
# ============================================================================
DB_HOST=localhost
DB_PORT=5432
DB_USER=qrcode
DB_PASSWORD=postgres
DB_NAME=qrcode_db

# Construido automáticamente:
# DATABASE_URL=postgresql://qrcode:postgres@localhost:5432/qrcode_db

# ============================================================================
# REDIS
# ============================================================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123
REDIS_DB=0

# ============================================================================
# AUTENTICACIÓN JWT
# ============================================================================
JWT_SECRET=your-super-secret-key-change-in-production-now!!!
JWT_EXPIRATION=3600                    # 1 hora en segundos
JWT_REFRESH_EXPIRATION=604800          # 7 días en segundos

# ============================================================================
# RATE LIMITING
# ============================================================================
RATE_LIMIT_WINDOW_MS=900000             # 15 minutos en ms
RATE_LIMIT_MAX_REQUESTS=100             # Máximo de requests por ventana
RATE_LIMIT_ENABLED=true

# ============================================================================
# CACHE
# ============================================================================
CACHE_TTL=3600                          # TTL por defecto en segundos
QR_CACHE_TTL=604800                     # 7 días para QRs

# ============================================================================
# LOGGING
# ============================================================================
LOG_LEVEL=debug                         # debug, info, warn, error
LOG_FILE=logs/app.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=14

# ============================================================================
# SMTP/EMAIL (Opcional para notificaciones)
# ============================================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@qrcodegenerator.com

# ============================================================================
# AWS S3 (Opcional para almacenar QRs en cloud)
# ============================================================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name

# ============================================================================
# CORS
# ============================================================================
CORS_ORIGIN=http://localhost:3001,http://localhost:3000

# ============================================================================
# SEED DATABASE (para desarrollo)
# ============================================================================
SEED_DATABASE=true
```

### Variables de Entorno por Ambiente

```env
# .env.development
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
RATE_LIMIT_ENABLED=true
SEED_DATABASE=true
```

```env
# .env.test
NODE_ENV=test
PORT=3001
DB_NAME=qrcode_db_test
LOG_LEVEL=warn
RATE_LIMIT_ENABLED=false
SEED_DATABASE=false
```

```env
# .env.production
NODE_ENV=production
PORT=3000
LOG_LEVEL=warn
RATE_LIMIT_ENABLED=true
SEED_DATABASE=false
# Aquí van valores reales en el servidor
```

### Configuración de Rate Limiting

```typescript
// src/common/config/rate-limit.config.ts

import { registerDecorator, ValidatorConstraint } from 'class-validator';

export const RATE_LIMIT_KEY = 'rate_limit';

export interface RateLimitConfig {
  windowMs: number; // milliseconds
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
  message?: string;
}

// Rate limits por endpoint
export const RATE_LIMITS = {
  DEFAULT: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100,
  },
  AUTH_LOGIN: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5, // 5 intentos de login
  },
  AUTH_REGISTER: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 3, // 3 registros por hora
  },
  QR_CREATE: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 500, // 500 QRs por hora
  },
};
```

### Configuración de Redis

```typescript
// src/common/config/redis.config.ts

import { CacheModuleOptions } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigService } from '@nestjs/config';

export const redisConfig = (configService: ConfigService): CacheModuleOptions => ({
  isGlobal: true,
  store: redisStore,
  host: configService.get('REDIS_HOST'),
  port: configService.get('REDIS_PORT'),
  password: configService.get('REDIS_PASSWORD'),
  auth_pass: configService.get('REDIS_PASSWORD'),
  db: 0,
  ttl: 3600, // 1 hora
});
```

### Configuración de JWT

```typescript
// src/common/config/jwt.config.ts

import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const jwtConfig = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.get('JWT_SECRET'),
  signOptions: {
    expiresIn: configService.get('JWT_EXPIRATION'),
    algorithm: 'HS256',
  },
});

export const jwtRefreshConfig = (
  configService: ConfigService,
): JwtModuleOptions => ({
  secret: configService.get('JWT_SECRET'),
  signOptions: {
    expiresIn: configService.get('JWT_REFRESH_EXPIRATION'),
    algorithm: 'HS256',
  },
});
```

### Configuración de Base de Datos

```typescript
// src/common/config/database.config.ts

import { ConfigService } from '@nestjs/config';

export const databaseConfig = (configService: ConfigService) => ({
  isGlobal: true,
  // La conexión se realiza automáticamente a través del DATABASE_URL
});
```

---

## 💻 Ejemplos de Código

### Ejemplo 1: AuthService

```typescript
// src/modules/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@modules/users/users.service';
import { CacheService } from '@modules/cache/cache.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private cacheService: CacheService,
    private prisma: PrismaService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName } = registerDto;

    // Verificar que el usuario no existe
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    // Generar tokens
    return this.generateAuthResponse(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Buscar usuario
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email o contraseña inválido');
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Email o contraseña inválido');
    }

    // Verificar si usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    return this.generateAuthResponse(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      // Verificar sinatura del token
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      // Buscar en BD
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!storedToken || storedToken.isRevoked) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      if (new Date() > storedToken.expiresAt) {
        throw new UnauthorizedException('Refresh token expirado');
      }

      const user = await this.usersService.findById(decoded.sub);

      // Revocar token anterior
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },
      });

      return this.generateAuthResponse(user);
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  private async generateAuthResponse(user: any): Promise<AuthResponseDto> {
    const accessToken = this.generateAccessToken(user);
    const { token: refreshToken, expiresAt } =
      await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get('JWT_EXPIRATION'),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  private generateAccessToken(user: any): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) +
        this.configService.get('JWT_EXPIRATION'),
    };

    return this.jwtService.sign(payload);
  }

  private async generateRefreshToken(userId: string) {
    const expiresAt = new Date(
      Date.now() + this.configService.get('JWT_REFRESH_EXPIRATION') * 1000,
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
      },
    );

    // Guardar en BD
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    // Guardar en cache para acceso rápido
    await this.cacheService.set(
      `refresh_token:${refreshToken}`,
      userId,
      this.configService.get('JWT_REFRESH_EXPIRATION'),
    );

    return { token: refreshToken, expiresAt };
  }
}
```

### Ejemplo 2: QrCodesController

```typescript
// src/modules/qr-codes/qr-codes.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '@common/guards/jwt.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { QrCodesService } from './qr-codes.service';
import { CreateQrDto } from './dto/create-qr.dto';
import { UpdateQrDto } from './dto/update-qr.dto';
import { QrResponseDto } from './dto/qr-response.dto';
import { QrListDto } from './dto/qr-list.dto';

@Controller('qr-codes')
@UseGuards(JwtAuthGuard)
export class QrCodesController {
  constructor(private qrCodesService: QrCodesService) {}

  /**
   * Crear un nuevo QR code
   * POST /qr-codes
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createQrDto: CreateQrDto,
    @CurrentUser() user: User,
  ): Promise<QrResponseDto> {
    return this.qrCodesService.create(user.id, createQrDto);
  }

  /**
   * Obtener todos los QR codes del usuario (paginado)
   * GET /qr-codes?page=1&limit=10&status=active
   */
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @CurrentUser() user: User,
  ): Promise<QrListDto> {
    return this.qrCodesService.findAll(user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });
  }

  /**
   * Obtener un QR code específico
   * GET /qr-codes/:id
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<QrResponseDto> {
    return this.qrCodesService.findOne(id, user.id);
  }

  /**
   * Actualizar metadatos de un QR code
   * PUT /qr-codes/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateQrDto: UpdateQrDto,
    @CurrentUser() user: User,
  ): Promise<QrResponseDto> {
    return this.qrCodesService.update(id, user.id, updateQrDto);
  }

  /**
   * Eliminar un QR code
   * DELETE /qr-codes/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.qrCodesService.remove(id, user.id);
  }

  /**
   * Descargar QR en formato específico
   * GET /qr-codes/:id/download?format=png
   */
  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @Query('format') format: string = 'png',
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    if (!['png', 'svg'].includes(format.toLowerCase())) {
      throw new BadRequestException('Formato no soportado');
    }

    const buffer = await this.qrCodesService.downloadQr(id, user.id, format);

    const contentType = format.toLowerCase() === 'png' ?
      'image/png' : 'image/svg+xml';

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="qr-${id}.${format.toLowerCase()}"`,
    );
    res.send(buffer);
  }

  /**
   * Obtener estadísticas de un QR code
   * GET /qr-codes/:id/stats
   */
  @Get(':id/stats')
  async getStats(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.qrCodesService.getStats(id, user.id);
  }

  /**
   * Archivar un QR code
   * PATCH /qr-codes/:id/archive
   */
  @Post(':id/archive')
  async archive(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<QrResponseDto> {
    return this.qrCodesService.archive(id, user.id);
  }
}
```

### Ejemplo 3: QrCodesService

```typescript
// src/modules/qr-codes/qr-codes.service.ts

import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CacheService } from '@modules/cache/cache.service';
import { QrGeneratorService } from './qr-generator.service';
import { CreateQrDto } from './dto/create-qr.dto';
import { UpdateQrDto } from './dto/update-qr.dto';
import { QrResponseDto } from './dto/qr-response.dto';
import { QrListDto } from './dto/qr-list.dto';
import { QrCodesRepository } from './repositories/qr-codes.repository';

@Injectable()
export class QrCodesService {
  private readonly QR_CACHE_TTL = 7 * 24 * 60 * 60; // 7 días

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    private qrGenerator: QrGeneratorService,
    private qrRepository: QrCodesRepository,
  ) {}

  async create(userId: string, createQrDto: CreateQrDto): Promise<QrResponseDto> {
    const { targetUrl, title, description, format, size, errorCorrection, tags } =
      createQrDto;

    // Validar URL
    try {
      new URL(targetUrl);
    } catch {
      throw new BadRequestException('URL inválida');
    }

    // Generar QR
    const qrData = await this.qrGenerator.generate({
      data: targetUrl,
      format,
      size: size || 300,
      errorCorrection: errorCorrection || 'M',
    });

    // Guardar en BD
    const qrCode = await this.qrRepository.create({
      userId,
      targetUrl,
      title,
      description: description || '',
      format,
      qrData,
      status: 'ACTIVE',
    });

    // Guardar tags si existen
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await this.prisma.qrMetadata.create({
          data: {
            qrId: qrCode.id,
            key: 'tag',
            value: tag,
          },
        });
      }
    }

    // Guardar en cache
    await this.cacheService.set(
      `qr:${qrCode.id}`,
      qrCode,
      this.QR_CACHE_TTL,
    );

    return this.mapToResponseDto(qrCode);
  }

  async findAll(
    userId: string,
    options: { page: number; limit: number; status?: string },
  ): Promise<QrListDto> {
    const { page, limit, status } = options;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) {
      where.status = status.toUpperCase();
    }

    const [data, total] = await Promise.all([
      this.qrRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.qrCode.count({ where }),
    ]);

    return {
      data: data.map(qr => this.mapToResponseDto(qr)),
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    };
  }

  async findOne(id: string, userId: string): Promise<QrResponseDto> {
    // Intentar obtener del cache
    const cached = await this.cacheService.get(`qr:${id}`);
    if (cached) {
      return this.mapToResponseDto(cached);
    }

    // Buscar en BD
    const qrCode = await this.qrRepository.findOne(id);
    if (!qrCode) {
      throw new NotFoundException('QR code no encontrado');
    }

    // Verificar que pertenece al usuario
    if (qrCode.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para acceder a este QR');
    }

    // Guardar en cache
    await this.cacheService.set(
      `qr:${id}`,
      qrCode,
      this.QR_CACHE_TTL,
    );

    return this.mapToResponseDto(qrCode);
  }

  async update(
    id: string,
    userId: string,
    updateQrDto: UpdateQrDto,
  ): Promise<QrResponseDto> {
    const qrCode = await this.getQrCodeAndVerifyOwnership(id, userId);

    const updated = await this.qrRepository.update(id, {
      title: updateQrDto.title,
      description: updateQrDto.description,
    });

    // Invalidar cache
    await this.cacheService.del(`qr:${id}`);

    return this.mapToResponseDto(updated);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.getQrCodeAndVerifyOwnership(id, userId);

    await this.qrRepository.delete(id);

    // Invalidar cache
    await this.cacheService.del(`qr:${id}`);
  }

  async archive(id: string, userId: string): Promise<QrResponseDto> {
    const qrCode = await this.getQrCodeAndVerifyOwnership(id, userId);

    const updated = await this.qrRepository.update(id, {
      status: 'ARCHIVED',
    });

    // Invalidar cache
    await this.cacheService.del(`qr:${id}`);

    return this.mapToResponseDto(updated);
  }

  async downloadQr(id: string, userId: string, format: string): Promise<Buffer> {
    const qrCode = await this.getQrCodeAndVerifyOwnership(id, userId);

    const base64Data = qrCode.qrData.toString();

    if (format.toLowerCase() === 'svg') {
      return Buffer.from(base64Data, 'base64');
    }

    // Para PNG
    return Buffer.from(base64Data, 'base64');
  }

  async getStats(id: string, userId: string) {
    const qrCode = await this.getQrCodeAndVerifyOwnership(id, userId);

    const stats = await this.prisma.scanLog.groupBy({
      by: ['scannedAt'],
      where: { qrId: id },
      _count: true,
      orderBy: {
        scannedAt: 'desc',
      },
      take: 30,
    });

    return {
      id: qrCode.id,
      totalScans: qrCode.scans,
      recentScans: stats,
    };
  }

  private async getQrCodeAndVerifyOwnership(id: string, userId: string) {
    const qrCode = await this.qrRepository.findOne(id);
    if (!qrCode) {
      throw new NotFoundException('QR code no encontrado');
    }

    if (qrCode.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para acceder a este QR');
    }

    return qrCode;
  }

  private mapToResponseDto(qrCode: any): QrResponseDto {
    return {
      id: qrCode.id,
      userId: qrCode.userId,
      targetUrl: qrCode.targetUrl,
      title: qrCode.title,
      description: qrCode.description,
      format: qrCode.format,
      qrData: qrCode.qrData,
      status: qrCode.status,
      scans: qrCode.scans,
      createdAt: qrCode.createdAt,
      updatedAt: qrCode.updatedAt,
    };
  }
}
```

### Ejemplo 4: QrGeneratorService

```typescript
// src/modules/qr-codes/qr-generator.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import * as QRCode from 'qrcode';

export interface QrGenerationOptions {
  data: string;
  format: 'PNG' | 'SVG';
  size?: number;
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';
  color?: {
    dark: string;
    light: string;
  };
}

@Injectable()
export class QrGeneratorService {
  async generate(options: QrGenerationOptions): Promise<string> {
    const {
      data,
      format,
      size = 300,
      errorCorrection = 'M',
      color = { dark: '#000000', light: '#ffffff' },
    } = options;

    try {
      if (format === 'PNG') {
        // Generar PNG
        const buffer = await QRCode.toBuffer(data, {
          type: 'image/png',
          width: size,
          errorCorrectionLevel: errorCorrection,
          color,
        });

        return buffer.toString('base64');
      } else if (format === 'SVG') {
        // Generar SVG
        const svg = await QRCode.toString(data, {
          type: 'svg',
          width: size,
          errorCorrectionLevel: errorCorrection,
          color,
        });

        return Buffer.from(svg).toString('base64');
      }

      throw new BadRequestException('Formato no soportado');
    } catch (error) {
      throw new BadRequestException(
        `Error generando QR: ${error.message}`,
      );
    }
  }
}
```

### Ejemplo 5: Repository Pattern

```typescript
// src/modules/qr-codes/repositories/qr-codes.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class QrCodesRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.QrCodeCreateInput) {
    return this.prisma.qrCode.create({
      data,
    });
  }

  async findOne(id: string) {
    return this.prisma.qrCode.findUnique({
      where: { id },
      include: {
        metadata: true,
      },
    });
  }

  async findMany(args: Prisma.QrCodeFindManyArgs) {
    return this.prisma.qrCode.findMany(args);
  }

  async update(id: string, data: Prisma.QrCodeUpdateInput) {
    return this.prisma.qrCode.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.qrCode.delete({
      where: { id },
    });
  }

  async countByUser(userId: string) {
    return this.prisma.qrCode.count({
      where: { userId },
    });
  }
}
```

---

## 🚀 Plan de Implementación

### 📋 Fase 1: Configuración Base (Semana 1)

**Objetivos:**
- [ ] Crear estructura de proyecto y carpetas
- [ ] Configurar Docker y docker-compose
- [ ] Conectar PostgreSQL y Prisma
- [ ] Configurar variables de entorno
- [ ] Configurar TypeScript y linters

**Entregables:**
- Proyecto NestJS funcionando en Docker
- Database operacional
- Migraciones configuradas

**Tiempo estimado:** 4-6 horas

---

### 📋 Fase 2: Autenticación (Semana 1-2)

**Objetivos:**
- [ ] Crear UsersModule (CRUD básico)
- [ ] Implementar AuthModule con JWT
- [ ] Crear Guards y Decorators
- [ ] Implementar Refresh Token
- [ ] Testing de auth endpoints

**Entregables:**
- `/auth/register` - Registro de usuarios
- `/auth/login` - Login y token
- `/auth/refresh` - Refresh token
- `/users/profile` - Perfil del usuario
- `/users/change-password` - Cambio de contraseña

**Tiempo estimado:** 8-10 horas

---

### 📋 Fase 3: QR Codes - CRUD (Semana 2-3)

**Objetivos:**
- [ ] Crear QrCodesModule
- [ ] Implementar servicio de generación QR
- [ ] CRUD de QR codes
- [ ] Validación de URLs
- [ ] Paginación y filtros

**Entregables:**
- `POST /qr-codes` - Crear QR
- `GET /qr-codes` - Listar QRs (paginado)
- `GET /qr-codes/:id` - Obtener QR
- `PUT /qr-codes/:id` - Actualizar QR
- `DELETE /qr-codes/:id` - Eliminar QR

**Tiempo estimado:** 8-10 horas

---

### 📋 Fase 4: Cache y Redis (Semana 3)

**Objetivos:**
- [ ] Configurar Redis
- [ ] Implementar CacheModule
- [ ] Caché de QR codes
- [ ] Rate limiting
- [ ] Caché de usuarios

**Entregables:**
- CacheService funcional
- RateLimitGuard activo
- Hit rate > 80% en QRs frecuentes

**Tiempo estimado:** 6-8 horas

---

### 📋 Fase 5: Analytics (Semana 4)

**Objetivos:**
- [ ] Crear AnalyticsModule
- [ ] Registrar escaneos
- [ ] Estadísticas por QR
- [ ] Dashboard de usuario

**Entregables:**
- `GET /qr-codes/:id/stats` - Estadísticas QR
- `POST /analytics/scan` - Registrar escaneo
- Gráficos de escaneos

**Tiempo estimado:** 6-8 horas

---

### 📋 Fase 6: Seguridad y Manejo de errores (Semana 4-5)

**Objetivos:**
- [ ] Implementar global exception filter
- [ ] Validación con class-validator
- [ ] Logging centralizado
- [ ] CORS configurado
- [ ] Helmet para headers de seguridad

**Entregables:**
- Respuestas de error consistentes
- Logs estruturados
- Headers de seguridad

**Tiempo estimado:** 6-8 horas

---

### 📋 Fase 7: Testing y Documentación (Semana 5)

**Objetivos:**
- [ ] Tests unitarios
- [ ] Tests E2E
- [ ] Documentación API (Swagger)
- [ ] Guía de instalación
- [ ] Deploy script

**Entregables:**
- Cobertura > 80%
- Swagger docs completo
- README actualizado

**Tiempo estimado:** 8-10 horas

---

### 📋 Fase 8: Deployment (Semana 5-6)

**Objetivos:**
- [ ] Optimizar Dockerfile
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Scripts de migración
- [ ] Monitoreo y logs
- [ ] Backup de BD

**Entregables:**
- Deploy automatizado
- Health checks operacionales
- Estrategia de backup

**Tiempo estimado:** 6-8 horas

---

## 🎯 Checklist Completo

### Desarrollo
- [ ] Estructura de carpetas creada
- [ ] Docker y docker-compose funcionando
- [ ] Base de datos conectada
- [ ] Variables de entorno configuradas
- [ ] Prisma schema completo
- [ ] UsersModule con CRUD
- [ ] AuthModule con JWT
- [ ] QrCodesModule funcional
- [ ] CacheService implementado
- [ ] Rate limiting activo
- [ ] AnalyticsModule funcionando
- [ ] HealthModule con checks
- [ ] Global Exception Filter
- [ ] Logging centralizado
- [ ] Validación en DTOs
- [ ] Guards y Decorators custom

### Seguridad
- [ ] JWT configurado correctamente
- [ ] Refresh tokens almacenados
- [ ] Roles y permisos implementados
- [ ] Rate limiting por usuario
- [ ] CORS configurado
- [ ] Helmet agregado
- [ ] Validación de entrada
- [ ] Contraseñas hasheadas
- [ ] Variables sensibles en .env
- [ ] Token blacklist si aplica

### Testing
- [ ] Tests unitarios auth
- [ ] Tests unitarios qr-codes
- [ ] Tests E2E completos
- [ ] Coverage > 80%
- [ ] CI/CD configurado

### Documentación
- [ ] README.md completo
- [ ] ARQUITECTURA.md (este documento)
- [ ] API.md con Swagger
- [ ] Guía de contribución
- [ ] Guía de deployment
- [ ] Seeding script

### DevOps
- [ ] Dockerfile optimizado
- [ ] docker-compose.yml completo
- [ ] .env.example completado
- [ ] healthcheck endpoints
- [ ] logging centralizado
- [ ] monitoring básico

---

## 🔧 Comandos de Inicialización

### 1. Clonar el proyecto y entrar en la carpeta

```bash
cd /home/erick/projects/QRCodes
```

### 2. Crear estructura inicial con NestJS CLI

```bash
npm i -g @nestjs/cli
nest new . --package-manager npm --git false
```

### 3. Instalar dependencias principales

```bash
npm install @nestjs/common @nestjs/core @nestjs/platform-express
npm install @nestjs/config
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local
npm install @prisma/client prisma
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store
npm install bcrypt
npm install qrcode
npm install class-validator class-transformer
npm install winston
npm install helmet cors

# Dependencias de desarrollo
npm install -D @types/bcrypt @types/node @types/express
npm install -D @nestjs/testing jest ts-jest
npm install -D eslint @typescript-eslint/eslint-plugin
npm install -D prettier
```

### 4. Crear archivo .env

```bash
cp config/.env.example .env
# Editar .env con tus valores
```

### 5. Inicializar Prisma

```bash
npx prisma init
# Actualizar DATABASE_URL en .env
```

### 6. Crear migraciones

```bash
npx prisma migrate dev --name init
```

### 7. Generar Prisma Client

```bash
npx prisma generate
```

### 8. Levantar servicios con Docker

```bash
docker-compose up -d
```

### 9. Ejecutar seed (opcional)

```bash
npx prisma db seed
```

### 10. Iniciar servidor de desarrollo

```bash
npm run start:dev
```

### 11. Verificar health

```bash
curl http://localhost:3000/health
```

---

## 📚 Comandos Útiles Rápidos

```bash
# Desarrollo
npm run start:dev              # Iniciar en modo watch
npm run build                  # Compilar para producción
npm start                      # Iniciar producción

# Prisma
npx prisma studio             # Abrir interfaz visual
npx prisma migrate dev         # Crear y correr migraciones
npx prisma migrate reset       # Resetear BD (desarrollo solo!)
npx prisma db seed            # Ejecutar seed

# Docker
docker-compose up -d           # Iniciar servicios
docker-compose down            # Parar servicios
docker-compose logs app        # Ver logs de la app
docker-compose ps              # Estado de servicios

# Testing
npm run test                   # Tests unitarios
npm run test:e2e              # Tests E2E
npm run test:cov              # Coverage report

# Linting
npm run lint                   # Verificar eslint
npm run lint:fix              # Corregir automáticamente

# Formato
npm run format                # Formatear con prettier
```

---

## 🎓 Recursos y Referencias

### Documentación Oficial
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Docker Docs](https://docs.docker.com)

### Librerías Utilizadas
- `qrcode` - Generación de QR codes
- `bcrypt` - Hashing de contraseñas
- `passport-jwt` - Estrategia JWT
- `cache-manager` - Gestión de caché
- `class-validator` - Validación de DTOs

### Patrones Implementados
- **Repository Pattern** - Abstracción de acceso a datos
- **Service Layer** - Lógica de negocio centralizada
- **Dependency Injection** - IoC container de NestJS
- **Middleware** - Procesamiento transversal
- **Interceptors** - Transformación de requests/responses
- **Guards** - Control de acceso
- **Decorators** - Metadatos y extensiones

---

## ✅ Resumen Ejecutivo

Este documento proporciona una **arquitectura profesional y completa** para construir un sistema de generación de QR codes con NestJS. La estructura está diseñada para ser:

✅ **Escalable** - Preparada para crecer sin refactorizar  
✅ **Mantenible** - Código limpio y organizado  
✅ **Segura** - Autenticación, autorización, validación  
✅ **Performante** - Cache, índices, optimizaciones  
✅ **Observable** - Logs, monitoring, health checks  
✅ **Documentada** - Comentarios y guías claras  

El tiempo estimado total de **implementación es de 5-6 semanas** trabajando 4-5 horas diarias de desarrollo dedicado.

---

**Última actualización:** Febrero 2026  
**Versión:** 1.0  
**Estado:** Listo para implementación

