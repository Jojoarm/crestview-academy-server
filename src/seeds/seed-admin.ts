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

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    logger.info('Super admin already exists — skipping seed');
    return;
  }

  // Use Better Auth to create the user so password is hashed correctly
  const { user } = await auth.api.signUpEmail({
    body: { email, password, name },
  });

  // Set role to super_admin, mark verified, no forced password change
  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: 'admin',
      userRole: 'super_admin',
      emailVerified: true,
      forcePasswordChange: false,
    },
  });

  // Create Admin record
  await prisma.admin.create({
    data: { userId: user.id },
  });

  logger.info('Super admin created successfully');
  logger.info(`Email:     ${email}`);
  logger.info(`User Role: super_admin`);
  logger.info(`Login at:  ${process.env.FRONTEND_URL}/auth/login`);
  logger.info('Remember to change your password after first login.');
}

main()
  .catch((e) => {
    logger.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
