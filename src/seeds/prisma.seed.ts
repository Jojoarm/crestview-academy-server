import { auth } from '../config/better.auth.js';
import prisma from '../config/prisma.js';
import { env } from '../utils/env.js';
import logger from '../utils/logger.js';

async function main() {
  const email = env.SEED_ADMIN_EMAIL;
  const password = env.SEED_ADMIN_PASSWORD;
  const name = env.SEED_ADMIN_NAME ?? 'Super Admin';

  if (!email || !password) {
    throw new Error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in your .env file',
    );
  }

  logger.info(`Seeding super admin: ${email}`);

  // Check if already seeded
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    logger.info('Super admin already exists — skipping seed');
    return;
  }

  // Use Better Auth's API to create the user properly
  // This ensures the password is hashed correctly by Better Auth
  const { user } = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
    },
  });

  // Create the Admin record linked to the user
  await prisma.admin.create({
    data: {
      userId: user.id,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  // Mark email as verified since this is a seed — no email needed
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true },
  });

  logger.info(`Super admin created successfully`);
  logger.info(`Email: ${email}`);
  logger.info(`Role: SUPER_ADMIN`);
  logger.info(`\nYou can now log in at ${process.env.FRONTEND_URL}/auth/login`);
}

main()
  .catch((e) => {
    logger.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
