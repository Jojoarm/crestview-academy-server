import { auth } from '../config/better.auth.js';
import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';

const TEST_PASSWORD = 'Test@1234';

const testUsers = [
  // Teachers
  {
    name: 'Mr. Adebayo Okafor',
    email: 'adebayo.okafor@crestview.edu.ng',
    userRole: 'teacher',
  },

  // Parents
  {
    name: 'Mr. Peter Okoro',
    email: 'peter.okoro@gmail.com',
    userRole: 'parent',
  },

  // Students
  {
    name: 'David Okoro',
    email: 'david.okoro@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Deborah Okoro',
    email: 'deborah.okoro@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Abdul Garba',
    email: 'abdul.garba@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Maryam Garba',
    email: 'maryam.garba@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Michael Udo',
    email: 'michael.udo@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Precious Udo',
    email: 'precious.udo@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Joshua Johnson',
    email: 'joshua.johnson@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Mercy Johnson',
    email: 'mercy.johnson@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Nathan Afolabi',
    email: 'nathan.afolabi@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Stephanie Afolabi',
    email: 'stephanie.afolabi@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Goodness Nwankwo',
    email: 'goodness.nwankwo@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Victor Oyeniyi',
    email: 'victor.oyeniyi@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Jessica Bassey',
    email: 'jessica.bassey@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Philip Ekanem',
    email: 'philip.ekanem@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Amarachi Chukwu',
    email: 'amarachi.chukwu@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Ebenezer Ojo',
    email: 'ebenezer.ojo@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Rachael Ogunleye',
    email: 'rachael.ogunleye@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Daniel Ezeani',
    email: 'daniel.ezeani@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Favour Onyekachi',
    email: 'favour.onyekachi@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Isaac Omotoso',
    email: 'isaac.omotoso@student.crestview.edu.ng',
    userRole: 'student',
  },
] as const;

const generateAdmissionNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `CRV/${year}/`;

  const last = await prisma.student.findFirst({
    where: { admissionNumber: { startsWith: prefix } },
    orderBy: { admissionNumber: 'desc' },
  });

  const lastNumber = last
    ? parseInt(last.admissionNumber.replace(prefix, ''), 10)
    : 0;

  const padded = String(lastNumber + 1).padStart(4, '0');
  return `${prefix}${padded}`;
};

const generateEmployeeId = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `CRV/TCH/${year}/`;

  const last = await prisma.teacher.findFirst({
    where: { employeeId: { startsWith: prefix } },
    orderBy: { employeeId: 'desc' },
  });

  const lastNumber = last
    ? parseInt(last.employeeId.replace(prefix, ''), 10)
    : 0;

  const padded = String(lastNumber + 1).padStart(3, '0');
  return `${prefix}${padded}`;
};

async function seedTestUsers() {
  logger.info('Seeding test users...');

  let created = 0;
  let skipped = 0;

  for (const userData of testUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existing) {
      logger.info(`Skipping ${userData.email} — already exists`);
      skipped++;
      continue;
    }

    try {
      const { user } = await auth.api.signUpEmail({
        body: {
          email: userData.email,
          password: TEST_PASSWORD,
          name: userData.name,
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'user',
          userRole: userData.userRole,
          emailVerified: true,
          forcePasswordChange: false,
        },
      });

      // Create role-specific record
      switch (userData.userRole) {
        case 'teacher': {
          const employeeId = await generateEmployeeId();
          await prisma.teacher.create({
            data: { userId: user.id, employeeId },
          });
          break;
        }
        case 'parent': {
          await prisma.parent.create({
            data: { userId: user.id },
          });
          break;
        }
        case 'student': {
          const admissionNumber = await generateAdmissionNumber();
          await prisma.student.create({
            data: { userId: user.id, admissionNumber },
          });
          break;
        }
      }

      logger.info(
        `Created ${userData.userRole}: ${userData.name} (${userData.email})`,
      );
      created++;
    } catch (error) {
      logger.error(`Failed to create ${userData.email}:`, error);
    }
  }

  logger.info('─────────────────────────────────────────');
  logger.info(`Done. Created: ${created}, Skipped: ${skipped}`);
  logger.info(`All test users password: ${TEST_PASSWORD}`);
  logger.info('─────────────────────────────────────────');
}

seedTestUsers()
  .catch((e) => {
    logger.error('Test seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
