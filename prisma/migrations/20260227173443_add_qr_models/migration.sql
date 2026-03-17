-- CreateEnum
CREATE TYPE "qr_format" AS ENUM ('PNG', 'SVG');

-- CreateEnum
CREATE TYPE "qr_status" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');

-- CreateTable
CREATE TABLE "qr_codes" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "format" "qr_format" NOT NULL DEFAULT 'PNG',
    "qrData" TEXT NOT NULL,
    "status" "qr_status" NOT NULL DEFAULT 'ACTIVE',
    "scans" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_metadata" (
    "id" SERIAL NOT NULL,
    "qrId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scan_logs" (
    "id" SERIAL NOT NULL,
    "qrId" INTEGER NOT NULL,
    "userId" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "device" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scan_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_statistics" (
    "id" SERIAL NOT NULL,
    "qrId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "qr_codes_userId_idx" ON "qr_codes"("userId");

-- CreateIndex
CREATE INDEX "qr_codes_status_idx" ON "qr_codes"("status");

-- CreateIndex
CREATE INDEX "qr_codes_createdAt_idx" ON "qr_codes"("createdAt");

-- CreateIndex
CREATE INDEX "qr_metadata_qrId_idx" ON "qr_metadata"("qrId");

-- CreateIndex
CREATE UNIQUE INDEX "qr_metadata_qrId_key_key" ON "qr_metadata"("qrId", "key");

-- CreateIndex
CREATE INDEX "scan_logs_qrId_idx" ON "scan_logs"("qrId");

-- CreateIndex
CREATE INDEX "scan_logs_userId_idx" ON "scan_logs"("userId");

-- CreateIndex
CREATE INDEX "scan_logs_scannedAt_idx" ON "scan_logs"("scannedAt");

-- CreateIndex
CREATE INDEX "qr_statistics_qrId_idx" ON "qr_statistics"("qrId");

-- CreateIndex
CREATE INDEX "qr_statistics_date_idx" ON "qr_statistics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "qr_statistics_qrId_date_key" ON "qr_statistics"("qrId", "date");

-- AddForeignKey
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_metadata" ADD CONSTRAINT "qr_metadata_qrId_fkey" FOREIGN KEY ("qrId") REFERENCES "qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan_logs" ADD CONSTRAINT "scan_logs_qrId_fkey" FOREIGN KEY ("qrId") REFERENCES "qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan_logs" ADD CONSTRAINT "scan_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_statistics" ADD CONSTRAINT "qr_statistics_qrId_fkey" FOREIGN KEY ("qrId") REFERENCES "qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
