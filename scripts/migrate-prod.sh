#!/bin/bash
set -e

echo "Corriendo migraciones de produccion..."
bunx prisma migrate deploy --schema=./prisma/schema.prisma

echo "Generando Prisma Client..."
bunx prisma generate --schema=./prisma/schema.prisma

echo "Migracion completada exitosamente"
