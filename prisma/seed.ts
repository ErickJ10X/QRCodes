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

  const adminPasswordHash = await bcrypt.hash(adminPassword, saltRounds);
  const userPasswordHash = await bcrypt.hash(userPassword, saltRounds);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPasswordHash,
      firstName: adminFirstName,
      lastName: adminLastName,
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      email: adminEmail,
      password: adminPasswordHash,
      firstName: adminFirstName,
      lastName: adminLastName,
      role: 'ADMIN',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      password: userPasswordHash,
      firstName: userFirstName,
      lastName: userLastName,
      role: 'USER',
      isActive: true,
    },
    create: {
      email: userEmail,
      password: userPasswordHash,
      firstName: userFirstName,
      lastName: userLastName,
      role: 'USER',
      isActive: true,
    },
  });

  await prisma.$disconnect();

  console.log('Seed completed: admin and user are ready.');
  console.log(`ADMIN -> ${adminEmail}`);
  console.log(`USER  -> ${userEmail}`);
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
