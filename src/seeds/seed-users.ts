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
  {
    name: 'Mrs. Chioma Eze',
    email: 'chioma.eze@crestview.edu.ng',
    userRole: 'teacher',
  },
  {
    name: 'Mr. Emeka Nwosu',
    email: 'emeka.nwosu@crestview.edu.ng',
    userRole: 'teacher',
  },
  {
    name: 'Miss. Fatima Bello',
    email: 'fatima.bello@crestview.edu.ng',
    userRole: 'teacher',
  },
  {
    name: 'Mr. Segun Adeleke',
    email: 'segun.adeleke@crestview.edu.ng',
    userRole: 'teacher',
  },
  {
    name: 'Mrs. Ngozi Okonkwo',
    email: 'ngozi.okonkwo@crestview.edu.ng',
    userRole: 'teacher',
  },
  {
    name: 'Mr. Ibrahim Musa',
    email: 'ibrahim.musa@crestview.edu.ng',
    userRole: 'teacher',
  },

  // Parents
  {
    name: 'Mr. Tunde Fashola',
    email: 'tunde.fashola@gmail.com',
    userRole: 'parent',
  },
  {
    name: 'Mrs. Amina Yusuf',
    email: 'amina.yusuf@gmail.com',
    userRole: 'parent',
  },
  {
    name: 'Mr. Chukwudi Obi',
    email: 'chukwudi.obi@gmail.com',
    userRole: 'parent',
  },
  {
    name: 'Mrs. Blessing Adekunle',
    email: 'blessing.adekunle@gmail.com',
    userRole: 'parent',
  },
  {
    name: 'Mr. Rotimi Adesanya',
    email: 'rotimi.adesanya@gmail.com',
    userRole: 'parent',
  },

  // Students
  {
    name: 'Taiwo Fashola',
    email: 'taiwo.fashola@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Kehinde Fashola',
    email: 'kehinde.fashola@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Zainab Yusuf',
    email: 'zainab.yusuf@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Chidi Obi',
    email: 'chidi.obi@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Tomisin Adekunle',
    email: 'tomisin.adekunle@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Femi Adesanya',
    email: 'femi.adesanya@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Aisha Musa',
    email: 'aisha.musa@student.crestview.edu.ng',
    userRole: 'student',
  },
  {
    name: 'Emeka Nwosu Jr',
    email: 'emeka.nwosu.jr@student.crestview.edu.ng',
    userRole: 'student',
  },
] as const;

const generateAdmissionNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.student.count();
  const padded = String(count + 1).padStart(4, '0');
  return `CRV/${year}/${padded}`;
};

const generateEmployeeId = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.teacher.count();
  const padded = String(count + 1).padStart(3, '0');
  return `CRV/TCH/${year}/${padded}`;
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
