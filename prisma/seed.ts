import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

function toInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to run the seed');
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  const saltRounds = toInt(process.env.BCRYPT_SALT_ROUNDS, 10);

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@qrcodes.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!@#';
  const adminFirstName = process.env.SEED_ADMIN_FIRST_NAME ?? 'Admin';
  const adminLastName = process.env.SEED_ADMIN_LAST_NAME ?? 'User';

  const userEmail = process.env.SEED_USER_EMAIL ?? 'user@qrcodes.local';
  const userPassword = process.env.SEED_USER_PASSWORD ?? 'User123!@#';
  const userFirstName = process.env.SEED_USER_FIRST_NAME ?? 'Normal';
  const userLastName = process.env.SEED_USER_LAST_NAME ?? 'User';

  const defaultUserPassword =
    process.env.SEED_DEFAULT_USER_PASSWORD ?? 'User123!@#';

  const adminPasswordHash = await bcrypt.hash(adminPassword, saltRounds);
  const userPasswordHash = await bcrypt.hash(userPassword, saltRounds);

  const seedUsers = [
    {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      firstName: adminFirstName,
      lastName: adminLastName,
      role: 'ADMIN' as const,
    },
    {
      email: userEmail,
      passwordHash: userPasswordHash,
      firstName: userFirstName,
      lastName: userLastName,
      role: 'USER' as const,
    },
    {
      email: 'sarah@qrcodes.local',
      passwordHash: await bcrypt.hash(defaultUserPassword, saltRounds),
      firstName: 'Sarah',
      lastName: 'Mendez',
      role: 'USER' as const,
    },
    {
      email: 'mario@qrcodes.local',
      passwordHash: await bcrypt.hash(defaultUserPassword, saltRounds),
      firstName: 'Mario',
      lastName: 'Lopez',
      role: 'USER' as const,
    },
    {
      email: 'camila@qrcodes.local',
      passwordHash: await bcrypt.hash(defaultUserPassword, saltRounds),
      firstName: 'Camila',
      lastName: 'Ruiz',
      role: 'USER' as const,
    },
    {
      email: 'leon@qrcodes.local',
      passwordHash: await bcrypt.hash(defaultUserPassword, saltRounds),
      firstName: 'Leon',
      lastName: 'Perez',
      role: 'USER' as const,
    },
  ];

  const qrTemplates = [
    {
      title: 'Landing Principal',
      description: 'QR para home de marketing',
      targetUrl: 'https://example.com',
      format: 'PNG' as const,
      status: 'ACTIVE' as const,
      channel: 'web',
      campaign: 'always-on',
    },
    {
      title: 'Promo Abril',
      description: 'Campana estacional de abril',
      targetUrl: 'https://example.com/promo-april',
      format: 'SVG' as const,
      status: 'ACTIVE' as const,
      channel: 'print',
      campaign: 'spring-launch',
    },
    {
      title: 'Soporte',
      description: 'Acceso directo a centro de ayuda',
      targetUrl: 'https://example.com/support',
      format: 'PNG' as const,
      status: 'ARCHIVED' as const,
      channel: 'email',
      campaign: 'customer-success',
    },
  ];

  const usersByEmail = new Map<string, { id: number; email: string }>();
  let totalQrs = 0;
  let totalStatsRows = 0;
  let totalScanLogs = 0;

  try {
    for (const entry of seedUsers) {
      const upsertedUser = await prisma.user.upsert({
        where: { email: entry.email },
        update: {
          password: entry.passwordHash,
          firstName: entry.firstName,
          lastName: entry.lastName,
          role: entry.role,
          isActive: true,
        },
        create: {
          email: entry.email,
          password: entry.passwordHash,
          firstName: entry.firstName,
          lastName: entry.lastName,
          role: entry.role,
          isActive: true,
        },
      });

      usersByEmail.set(entry.email, {
        id: upsertedUser.id,
        email: upsertedUser.email,
      });
    }

    for (const user of usersByEmail.values()) {
      for (let i = 0; i < qrTemplates.length; i += 1) {
        const template = qrTemplates[i];
        const seedKey = `${user.email}-qr-${i + 1}`;

        const existingQr = await prisma.qrCode.findFirst({
          where: {
            userId: user.id,
            title: template.title,
            targetUrl: template.targetUrl,
          },
        });

        const qrCode = existingQr
          ? await prisma.qrCode.update({
              where: { id: existingQr.id },
              data: {
                description: template.description,
                format: template.format,
                status: template.status,
                qrData: `seed://qr/${seedKey}`,
              },
            })
          : await prisma.qrCode.create({
              data: {
                userId: user.id,
                title: template.title,
                targetUrl: template.targetUrl,
                description: template.description,
                format: template.format,
                status: template.status,
                qrData: `seed://qr/${seedKey}`,
              },
            });

        totalQrs += 1;

        await prisma.qrMetadata.upsert({
          where: { qrId_key: { qrId: qrCode.id, key: 'seedKey' } },
          update: { value: seedKey },
          create: { qrId: qrCode.id, key: 'seedKey', value: seedKey },
        });

        await prisma.qrMetadata.upsert({
          where: { qrId_key: { qrId: qrCode.id, key: 'channel' } },
          update: { value: template.channel },
          create: { qrId: qrCode.id, key: 'channel', value: template.channel },
        });

        await prisma.qrMetadata.upsert({
          where: { qrId_key: { qrId: qrCode.id, key: 'campaign' } },
          update: { value: template.campaign },
          create: {
            qrId: qrCode.id,
            key: 'campaign',
            value: template.campaign,
          },
        });

        let totalScansForQr = 0;

        for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
          const date = new Date();
          date.setUTCHours(0, 0, 0, 0);
          date.setUTCDate(date.getUTCDate() - dayOffset);

          const scanCount = Math.max(
            1,
            (i + 1) * 3 - dayOffset + (user.id % 3),
          );
          totalScansForQr += scanCount;

          await prisma.qrStatistic.upsert({
            where: { qrId_date: { qrId: qrCode.id, date } },
            update: { scanCount },
            create: {
              qrId: qrCode.id,
              date,
              scanCount,
            },
          });

          totalStatsRows += 1;
        }

        await prisma.scanLog.deleteMany({
          where: {
            qrId: qrCode.id,
            userAgent: {
              startsWith: 'SeedBot/',
            },
          },
        });

        const sampleScanLogs = [
          {
            ipAddress: `10.0.${(user.id % 10) + 1}.${(i + 1) * 11}`,
            country: 'AR',
            device: 'Mobile',
          },
          {
            ipAddress: `10.1.${(user.id % 10) + 2}.${(i + 1) * 7}`,
            country: 'MX',
            device: 'Desktop',
          },
          {
            ipAddress: `10.2.${(user.id % 10) + 3}.${(i + 1) * 5}`,
            country: 'CL',
            device: 'Tablet',
          },
        ];

        for (const [logIndex, log] of sampleScanLogs.entries()) {
          await prisma.scanLog.create({
            data: {
              qrId: qrCode.id,
              userId: user.id,
              ipAddress: log.ipAddress,
              userAgent: `SeedBot/${template.channel}/${logIndex + 1}`,
              country: log.country,
              device: log.device,
            },
          });
          totalScanLogs += 1;
        }

        await prisma.qrCode.update({
          where: { id: qrCode.id },
          data: { scans: totalScansForQr },
        });
      }
    }

    console.log('Seed completed with demo dataset.');
    console.log(`Users seeded: ${usersByEmail.size}`);
    console.log(`QR codes seeded/updated: ${totalQrs}`);
    console.log(`Statistics rows seeded/updated: ${totalStatsRows}`);
    console.log(`Scan logs seeded: ${totalScanLogs}`);
    console.log(`ADMIN -> ${adminEmail}`);
    console.log(`USER  -> ${userEmail}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
