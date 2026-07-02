import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';

const classes = [
  // Kindergarten
  { name: 'Kindergarten 1', section: 'Kindergarten' as const, arms: ['A'] },
  {
    name: 'Kindergarten 2',
    section: 'Kindergarten' as const,
    arms: ['A', 'B'],
  },

  // Nursery
  { name: 'Nursery 1', section: 'Nursery' as const, arms: ['A'] },
  { name: 'Nursery 2', section: 'Nursery' as const, arms: ['A', 'B'] },

  // Primary
  { name: 'Primary 1', section: 'Primary' as const, arms: ['A', 'B'] },
  { name: 'Primary 2', section: 'Primary' as const, arms: ['A', 'B'] },
  { name: 'Primary 3', section: 'Primary' as const, arms: ['A', 'B', 'C'] },
  { name: 'Primary 4', section: 'Primary' as const, arms: ['A', 'B', 'C'] },
  { name: 'Primary 5', section: 'Primary' as const, arms: ['A', 'B', 'C'] },
  { name: 'Primary 6', section: 'Primary' as const, arms: ['A', 'B'] },

  // Secondary — JSS
  { name: 'JSS 1', section: 'Secondary' as const, arms: ['A', 'B', 'C'] },
  { name: 'JSS 2', section: 'Secondary' as const, arms: ['A', 'B', 'C'] },
  { name: 'JSS 3', section: 'Secondary' as const, arms: ['A', 'B', 'C'] },

  // Secondary — SSS
  { name: 'SSS 1', section: 'Secondary' as const, arms: ['A', 'B', 'C'] },
  { name: 'SSS 2', section: 'Secondary' as const, arms: ['A', 'B'] },
  { name: 'SSS 3', section: 'Secondary' as const, arms: ['A', 'B'] },
] as const;

const DEFAULT_CAPACITY = 40;

async function seedClasses() {
  logger.info('Clearing existing class arms and class levels...');

  // Delete in correct order to respect foreign key constraints
  await prisma.classArm.deleteMany();
  await prisma.classLevel.deleteMany();

  logger.info('Cleared. Fetching arms...');

  const arms = await prisma.arm.findMany();

  if (arms.length === 0) {
    throw new Error(
      'No arms found in the database. Create arms A, B, C first.',
    );
  }

  const armMap = new Map(arms.map((arm) => [arm.name, arm.id]));

  // Verify A, B, C all exist
  const missingArms = ['A', 'B', 'C'].filter((name) => !armMap.has(name));
  if (missingArms.length > 0) {
    throw new Error(
      `Missing arms: ${missingArms.join(', ')}. Create them first.`,
    );
  }

  logger.info(`Found arms: ${arms.map((a) => a.name).join(', ')}`);
  logger.info('Seeding classes...');

  let classCount = 0;
  let armCount = 0;

  for (const classData of classes) {
    const classLevel = await prisma.classLevel.create({
      data: {
        name: classData.name,
        section: classData.section,
      },
    });

    for (const armName of classData.arms) {
      const armId = armMap.get(armName);
      if (!armId) continue;

      await prisma.classArm.create({
        data: {
          classLevelId: classLevel.id,
          armId,
          capacity: DEFAULT_CAPACITY,
        },
      });
      armCount++;
    }

    logger.info(
      `Created ${classData.name} (${classData.section}) with arms: ${classData.arms.join(', ')}`,
    );
    classCount++;
  }

  logger.info('─────────────────────────────────────────');
  logger.info(
    `Done. Created ${classCount} classes and ${armCount} class arms.`,
  );
  logger.info(`Default capacity per arm: ${DEFAULT_CAPACITY}`);
  logger.info('─────────────────────────────────────────');
}

seedClasses()
  .catch((e) => {
    logger.error('Class seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
