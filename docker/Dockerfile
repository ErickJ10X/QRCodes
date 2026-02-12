FROM node:20-alpine

WORKDIR /app

# Copiar dependencias (cacheable)
COPY package*.json ./
RUN npm install

# Copiar archivos de configuración (cambian menos)
COPY tsconfig*.json nest-cli.json prisma.config.ts ./

# Copiar código (cambia más frecuentemente)
COPY src ./src
COPY prisma ./prisma

# Compilar TypeScript
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main.js"]
