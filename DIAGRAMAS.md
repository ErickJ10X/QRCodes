# 📊 Diagramas de Arquitectura

## 🏛️ Arquitectura de Capas (Simplificada)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend)                           │
│              (React, Vue, Angular, Mobile)                      │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST
                         │
┌─────────────────────────▼────────────────────────────────────────┐
│                    🌐 API GATEWAY                               │
│                 (NestJS Controllers)                            │
│                                                                  │
│  POST /auth/login      POST /qr-codes     GET /analytics/stats  │
│  POST /auth/register   GET /qr-codes/:id  POST /analytics/scan  │
│  POST /auth/refresh    PUT /qr-codes/:id  DELETE /qr-codes/:id  │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────────┐
        │                │                    │
        ▼                ▼                    ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Guards     │  │   Pipes      │  │  Decorators  │
│              │  │              │  │              │
│ • JWT Auth   │  │ • Validation │  │ • @CurrentUser
│ • Roles      │  │ • Transform  │  │ • @Roles()   │
│ • Rate Limit │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
        │                │                    │
        └────────────────┼────────────────────┘
                         │
        ┌────────────────▼────────────────────┐
        │     🎯 MÓDULOS DE NEGOCIO          │
        │  (Services & Business Logic)       │
        │                                     │
        │  ┌─────────────────────────────┐   │
        │  │  AuthService                │   │
        │  │  UsersService               │   │
        │  │  QrCodesService             │   │
        │  │  QrGeneratorService         │   │
        │  │  AnalyticsService           │   │
        │  │  CacheService               │   │
        │  └─────────────────────────────┘   │
        └────────────────┬────────────────────┘
                         │
        ┌────────────────┼────────────────────┐
        │                │                    │
        ▼                ▼                    ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 🗄️ PRISMA    │  │ 🔴 REDIS     │  │ 📝 LOGGING   │
│ ORM          │  │ CACHE        │  │              │
│              │  │              │  │  • Winston   │
│ • Queries    │  │ • Sessions   │  │  • Structured│
│ • Mutations  │  │ • QR Cache   │  │  • Audit Log │
│ • Relations  │  │ • RateLimit  │  │              │
└──────┬───────┘  └──────┬───────┘  └──────────────┘
       │                 │
       └─────────┬───────┘
                 │
        ┌────────▼────────┐
        │  📊 DATOS       │
        │                 │
        │ PostgreSQL 15   │
        │ • users         │
        │ • refresh_tokens│
        │ • qr_codes      │
        │ • scan_logs     │
        │ • statistics    │
        │ • audit_logs    │
        └─────────────────┘
```

---

## 🔐 Flujo de Autenticación

```
USER                    NESTJS APP                    DB/CACHE
│                            │                            │
├──── POST /auth/login ────►│                            │
│                  (email, password)                      │
│                            │                            │
│                            ├──── Buscar usuario ───────►│
│                            │                            │
│                            │◄─── Usuario encontrado ────┤
│                            │                            │
│                            ├─── Validar contraseña      │
│                            │    (bcrypt.compare)        │
│                            │                            │
│◄─── {accessToken, refreshToken} ───│                   │
│                            │                            │
│                            ├──► Guardar refreshToken ──►│
│                            │    en BD + Redis           │
│                            │                            │
│                            │◄───────────────────────────┤
│
├── GET /api/qr-codes ──────────┐
│  (con Authorization: Bearer...) │
│                            │    │
│                            │◄───┘
│                            │
│                            ├─── Extraer token
│                            │    from header
│                            │
│                            ├─── JwtStrategyValidate
│                            │    (verifySignature,
│                            │     checkExpiration)
│                            │
│                            ├─── Ejecutar endpoint
│                            │    (si válido)
│                            │
│◄── {data} ─────────────────┤
```

---

## 📦 Flujo de Crear QR Code

```
CLIENT BROWSER                          NESTJS SERVER
│                                              │
├──── POST /qr-codes ─────────────────────────►│
│  Authorization: Bearer <token>              │
│  Body: {targetUrl, title, format, ...}      │
│                                              │
│                                    ┌─────────┴─────────┐
│                              1. JwtAuthGuard           │
│                                  (Validar token)       │
│                                      │                 │
│                              2. QrCodesController      │
│                                  .create()             │
│                                      │                 │
│                              3. QrCodesService         │
│                                  .create()             │
│                                      │                 │
│                              4. Validar URL            │
│                                  .isValidUrl()         │
│                                      │                 │
│                              5. QrGeneratorService     │
│                                  .generate(PNG/SVG)    │
│                                      │                 │
│                              6. Guardar en BD          │
│                                  Prisma.create()       │
│                                      │                 │
│                              7. Guardar en Cache       │
│                                  Redis cache           │
│                                      │                 │
│◄──── {id, title, qrData, ...} ─────────────┤
│
│ [SUCCESS 201 Created]
│
│ {
│   "id": "clx123...",
│   "userId": "clx456...",
│   "targetUrl": "https://google.com",
│   "title": "Google",
│   "format": "PNG",
│   "qrData": "iVBORw0KGgoAAAANS...",
│   "scans": 0,
│   "createdAt": "2026-02-11T...",
│   "status": "ACTIVE"
│ }
```

---

## 🔄 Flujo de Caché Redis

```
REQUEST ENTRANTE
│
├──► CacheService.get(key)
│    │
│    ├── ¿Existe en Redis?
│    │   │
│    │   YES ──► Retornar valor (RÁPIDO ⚡)
│    │
│    │   NO ──► Continuar
│                  │
│                  ├──► Consultar BD
│                  │
│                  ├──► Guardar en Redis
│                  │    con TTL automático
│                  │
│                  └──► Retornar valor
│                       (Próxima vez será de cache)
│
│
INVALIDACIÓN DE CACHÉ:
│
├──► Al actualizar/eliminar
│
├──► CacheService.del(key)
│    │
│    └──► Próximo GET buscará en BD nuevamente
```

---

## 🚀 Pipeline de Request Completo

```
┌─────────────────── HTTP REQUEST ENTRANTE ───────────────────┐
│  POST /qr-codes                                             │
│  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...              │
│  Body: {targetUrl, title, format}                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                    ┌─────────────┐
                    │   express   │
                    │  Middleware │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Logger    │
                    │Interceptor  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ JwtAuthGuard│
                    │  Valida JWT │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   RolesGuard│
                    │ (si aplica) │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Validation  │
                    │    Pipe     │
                    │ (DTO valid) │
                    └──────┬──────┘
                           │
                    ┌──────▼──────────────┐
                    │ QrCodesController   │
                    │ .create(dto, user)  │
                    └──────┬──────────────┘
                           │
                    ┌──────▼──────────────┐
                    │ QrCodesService      │
                    │ .create()           │
                    │ ├─ Validar URL      │
                    │ ├─ Generar QR       │
                    │ └─ Guardar en BD    │
                    └──────┬──────────────┘
                           │
                    ┌──────▼──────────────┐
                    │ CacheService        │
                    │ .set(key, value)    │
                    └──────┬──────────────┘
                           │
                    ┌──────▼──────────────┐
                    │ Response Dto        │
                    │ Serializar JSON     │
                    └──────┬──────────────┘
                           │
                    ┌──────▼──────────────┐
                    │ Transform           │
                    │ Interceptor         │
                    └──────┬──────────────┘
                           │
┌──────────────────────────▼──────────────────────────┐
│         HTTP RESPONSE (201 Created)                 │
│  {                                                  │
│    "id": "...",                                     │
│    "qrData": "...",                                 │
│    "title": "..."                                   │
│  }                                                  │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Flujo de Rate Limiting

```
REQUEST ENTRANTE
│
├──► RateLimitInterceptor
│    │
│    ├─── Extraer identificador
│    │    (userId o IP)
│    │
│    ├─── Generar key Redis
│    │    key = "rate_limit:{userId}:{endpoint}"
│    │
│    ├─── Obtener contador actual
│    │    redis.get(key)
│    │
│    ├─ Contador < Límite?
│    │
│    YES ──┐
│         │
│         ├─── Incrementar contador
│         │     redis.incr(key)
│         │
│         ├─── Establecer TTL
│         │     redis.expire(key, 15min)
│         │
│         └──► Continuar procesamiento ✓
│
│    NO ──┐
│         │
│         └──► 429 Too Many Requests ✗
│              Retry-After: 45s
│
│
EJEMPLO:
key: rate_limit:clx123:POST:/qr-codes
value: 100    (intentos realizados)
ttl: 900s     (15 minutos restantes)
limit: 500    (máximo permitido)

status: ✓ Permitido (100 < 500)
```

---

## 🔌 Integración de Servicios

```
┌──────┐           ┌──────┐           ┌──────┐
│      │           │      │           │      │
│ Auth │◄─────────►│ JWT  │◄─────────►│ Users│
│Module│           │Config│           │Module│
│      │           │      │           │      │
└──────┘           └──────┘           └──────┘
   ▲                                      ▲
   │                                      │
   │                                      │
   └──────────────┬───────────────────────┘
                  │
         ┌────────▼────────┐
         │                 │
         │ Database Prisma │
         │                 │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌────────┐   ┌────────┐   ┌─────────┐
│QRCodes │   │Analytics   │ Health  │
│Module  │   │Module      │Module   │
└───┬────┘   └─────┬──────┘ └────────┘
    │              │
    │        ┌─────▼──────┐
    │        │            │
    │        │ Cache      │
    │        │ Service    │
    │        │            │
    │        └─────┬──────┘
    │              │
    └──────┬───────┘
           │
        ┌──▼──┐
        │     │
     ┌──│Redis│───┐
     │  │     │   │
     │  └─────┘   │
     │            │
     ▼            ▼
PostgreSQL      Session Cache
   (DB)         QR Cache
             RateLimit Keys
```

---

## 🌊 Diagrama de Componentes Detallado

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT / FRONTEND                 │
│            (Web Browser / Mobile App)                │
└──────────────────────┬───────────────────────────────┘
                       │
           ╔═══════════▼═══════════╗
           ║   REST API Gateway    ║  (Express + NestJS)
           ║  (Controllers Layer)  ║
           ╚═══════════╤═══════════╝
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼───┐    ┌────▼────┐   ┌────▼───┐
   │ Guards │    │  Pipes  │   │ Filters│
   │        │    │         │   │        │
   │JWT Auth│    │Validation   │Error   │
   │Roles   │    │Transform    │Handling│
   │RateLimit   └────┬────┘   └────────┘
   └────┬───┘        │
        └────┬───────┘
             │
    ╔════════▼════════╗
    ║  Services Layer ║  (Business Logic)
    ║                ║
    ║  Auth Service   ║
    ║  User Service   ║
    ║  QR Service     ║
    ║  Analytics Srv  ║
    ║  Cache Service  ║
    ║  QR Generator   ║
    ╚════════╤════════╝
             │
    ┌────────┼────────┐
    │        │        │
┌───▼──┐ ┌───▼──┐ ┌───▼──┐
│Cache │ │Logger│ │Audit │
│Module│ │Module│ │Module│
└───┬──┘ └──────┘ └──────┘
    │
┌───┴─────────────┬──────────────┐
│                 │              │
┌─▼──────┐   ┌─▼──────┐  ┌──▼──────┐
│ Prisma │   │ Prisma │  │ Winston  │
│ Client │   │Migrate │  │ Logger   │
└─┬──────┘   └────────┘  └──────────┘
  │
┌─▼──────────────────────────────────┐
│     PostgreSQL Database 15         │
│                                   │
│ Tables:                           │
│ • users                           │
│ • refresh_tokens                  │
│ • qr_codes                        │
│ • qr_metadata                     │
│ • scan_logs                       │
│ • qr_statistics                   │
│ • audit_logs                      │
└────────────────────────────────────┘

┌─────────────────────────────────────┐
│    Redis (In-Memory Cache)          │
│                                    │
│ Keys Stored:                       │
│ • refresh_token:{token}            │
│ • qr:{qrId}                        │
│ • rate_limit:{userId}:{endpoint}   │
│ • session:{sessionId}              │
└─────────────────────────────────────┘
```

---

## 🎯 Secuencia de Eventos: Crear QR y Registrar Escaneo

```
Timeline:

T0: Usuario crea QR
    Client POST /qr-codes
         │
         ▼
    NestJS procesa y guarda
         │
         ▼
    Se guarda en BD + Cache ✓

T1: Usuario (otro) escanea QR
    GET /qr-codes/:id/download ── Redirect a targetUrl
         │
         ▼
    User Agent + IP capturados
         │
         ▼
    POST /analytics/scan (background job)
         │
         ▼
    AnalyticsService.recordScan()
         │
         ▼
    Se registra en scan_logs ✓
    Se incrementa contador de scans ✓
    Se invalidata cache de ese QR

T2: Usuario original ve estadísticas
    GET /qr-codes/:id/stats
         │
         ▼
    Lee de BD últimos escaneos
         │
         ▼
    Retorna: {totalScans: 1, recentScans: [...]}
         │
         ▼
    Frontend muestra dashboard ✓
```

---

**Estos diagramas dan una visión completa de cómo fluyen los datos y se comunican los componentes.**

Para más detalles, consulta `ARQUITECTURA_COMPLETA.md`
