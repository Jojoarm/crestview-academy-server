import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';
import { Prisma } from '../generated/prisma/client.js';

// ─── Fee Types ────────────────────────────────────────────────────────────────

const feeTypes = [
  {
    name: 'Tuition',
    frequency: 'PerTerm',
    scope: 'PerClass',
    isOptional: false,
  },
  {
    name: 'Registration Fee',
    frequency: 'OneTime',
    scope: 'SchoolWide',
    isOptional: false,
  },
  {
    name: 'Admission Fee',
    frequency: 'OneTime',
    scope: 'SchoolWide',
    isOptional: false,
  },
  {
    name: 'Development Levy',
    frequency: 'Annual',
    scope: 'SchoolWide',
    isOptional: false,
  },
  {
    name: 'ICT Fee',
    frequency: 'PerTerm',
    scope: 'SchoolWide',
    isOptional: false,
  },
  {
    name: 'Library Fee',
    frequency: 'PerTerm',
    scope: 'SchoolWide',
    isOptional: false,
  },
  {
    name: 'Laboratory Fee',
    frequency: 'PerTerm',
    scope: 'SchoolWide',
    isOptional: true,
  },
  {
    name: 'Examination Fee',
    frequency: 'PerTerm',
    scope: 'SchoolWide',
    isOptional: false,
  },
  {
    name: 'Sports Fee',
    frequency: 'PerTerm',
    scope: 'SchoolWide',
    isOptional: false,
  },
  {
    name: 'Medical Fee',
    frequency: 'Annual',
    scope: 'SchoolWide',
    isOptional: false,
  },
  {
    name: 'PTA Levy',
    frequency: 'PerTerm',
    scope: 'SchoolWide',
    isOptional: false,
  },
  {
    name: 'Uniform',
    frequency: 'OneTime',
    scope: 'SchoolWide',
    isOptional: false,
  },
  { name: 'Books', frequency: 'Annual', scope: 'PerClass', isOptional: false },
  {
    name: 'Exercise Books',
    frequency: 'Annual',
    scope: 'PerClass',
    isOptional: false,
  },
  {
    name: 'Transport',
    frequency: 'PerTerm',
    scope: 'SchoolWide',
    isOptional: true,
  },
  {
    name: 'Feeding',
    frequency: 'PerTerm',
    scope: 'SchoolWide',
    isOptional: true,
  },
  {
    name: 'Boarding',
    frequency: 'PerTerm',
    scope: 'SchoolWide',
    isOptional: true,
  },
] as const;

// ─── Tuition amounts per class (PerTerm) ─────────────────────────────────────

const tuitionAmounts: Record<string, number> = {
  'Kindergarten 1': 85000,
  'Kindergarten 2': 85000,
  'Nursery 1': 90000,
  'Nursery 2': 90000,
  'Primary 1': 95000,
  'Primary 2': 95000,
  'Primary 3': 100000,
  'Primary 4': 100000,
  'Primary 5': 105000,
  'Primary 6': 105000,
  'JSS 1': 120000,
  'JSS 2': 120000,
  'JSS 3': 125000,
  'SSS 1': 140000,
  'SSS 2': 140000,
  'SSS 3': 150000,
};

// ─── Books amounts per class (Annual) ────────────────────────────────────────

const booksAmounts: Record<string, number> = {
  'Kindergarten 1': 15000,
  'Kindergarten 2': 15000,
  'Nursery 1': 18000,
  'Nursery 2': 18000,
  'Primary 1': 22000,
  'Primary 2': 22000,
  'Primary 3': 25000,
  'Primary 4': 25000,
  'Primary 5': 28000,
  'Primary 6': 28000,
  'JSS 1': 35000,
  'JSS 2': 35000,
  'JSS 3': 38000,
  'SSS 1': 45000,
  'SSS 2': 45000,
  'SSS 3': 48000,
};

// ─── Exercise Books amounts per class (Annual) ────────────────────────────────

const exerciseBooksAmounts: Record<string, number> = {
  'Kindergarten 1': 5000,
  'Kindergarten 2': 5000,
  'Nursery 1': 6000,
  'Nursery 2': 6000,
  'Primary 1': 7000,
  'Primary 2': 7000,
  'Primary 3': 8000,
  'Primary 4': 8000,
  'Primary 5': 9000,
  'Primary 6': 9000,
  'JSS 1': 10000,
  'JSS 2': 10000,
  'JSS 3': 11000,
  'SSS 1': 12000,
  'SSS 2': 12000,
  'SSS 3': 13000,
};

// ─── School-wide flat amounts ─────────────────────────────────────────────────

const schoolWideFees: Record<string, number> = {
  'Registration Fee': 15000,
  'Admission Fee': 25000,
  'Development Levy': 20000,
  'ICT Fee': 8000,
  'Library Fee': 5000,
  'Laboratory Fee': 10000,
  'Examination Fee': 7500,
  'Sports Fee': 5000,
  'Medical Fee': 8000,
  'PTA Levy': 10000,
  Uniform: 20000,
  Transport: 25000,
  Feeding: 45000,
  Boarding: 120000,
};

// ─── Helper: create structure only if it doesn't already exist ────────────────

const createStructureIfNotExists = async (data: {
  feeTypeId: string;
  amount: number;
  classLevelId?: string;
  sessionId?: string;
  termId?: string;
}) => {
  const existing = await prisma.feeStructure.findFirst({
    where: {
      feeTypeId: data.feeTypeId,
      classLevelId: data.classLevelId ?? null,
      sessionId: data.sessionId ?? null,
      termId: data.termId ?? null,
    },
  });

  if (existing) return false; // skipped

  await prisma.feeStructure.create({
    data: {
      feeTypeId: data.feeTypeId,
      amount: new Prisma.Decimal(data.amount),
      classLevelId: data.classLevelId ?? null,
      sessionId: data.sessionId ?? null,
      termId: data.termId ?? null,
    },
  });

  return true; // created
};

async function seedFees() {
  logger.info('Starting fee seed (skipping existing records)...');

  // ── Get active session + terms ────────────────────────────────────────────
  const session = await prisma.academicSession.findFirst({
    where: { isActive: true },
  });
  if (!session)
    throw new Error(
      'No active session found. Create and activate a session first.',
    );

  const terms = await prisma.term.findMany({
    where: { sessionId: session.id },
  });
  if (terms.length === 0)
    throw new Error('No terms found for active session. Create terms first.');

  const classLevels = await prisma.classLevel.findMany({
    orderBy: { name: 'asc' },
  });
  if (classLevels.length === 0)
    throw new Error('No class levels found. Run seed:classes first.');

  logger.info(`Active session: ${session.name}`);
  logger.info(`Terms found: ${terms.map((t) => t.name).join(', ')}`);
  logger.info(`Class levels found: ${classLevels.length}`);

  // ── Upsert fee types (create if not exists, skip if exists) ───────────────
  logger.info('Upserting fee types...');
  let feeTypesCreated = 0;
  let feeTypesSkipped = 0;

  for (const ft of feeTypes) {
    const result = await prisma.feeType.upsert({
      where: { name: ft.name },
      update: {}, // don't overwrite existing
      create: {
        name: ft.name,
        frequency: ft.frequency,
        scope: ft.scope,
        isOptional: ft.isOptional,
      },
    });

    // upsert always succeeds — check if it was just created by checking createdAt ≈ now
    const isNew = Date.now() - result.createdAt.getTime() < 3000;
    if (isNew) feeTypesCreated++;
    else feeTypesSkipped++;
  }

  logger.info(
    `Fee types — created: ${feeTypesCreated}, skipped: ${feeTypesSkipped}`,
  );

  // Refresh fee type map
  const allFeeTypes = await prisma.feeType.findMany();
  const feeTypeMap = new Map(allFeeTypes.map((ft) => [ft.name, ft]));

  // ── Create fee structures (skip existing) ─────────────────────────────────
  logger.info('Creating fee structures (skipping existing)...');
  let structuresCreated = 0;
  let structuresSkipped = 0;

  const track = (created: boolean) => {
    if (created) structuresCreated++;
    else structuresSkipped++;
  };

  // 1. OneTime + SchoolWide (Registration, Admission, Uniform)
  for (const name of ['Registration Fee', 'Admission Fee', 'Uniform']) {
    const feeType = feeTypeMap.get(name);
    if (!feeType || !schoolWideFees[name]) continue;
    track(
      await createStructureIfNotExists({
        feeTypeId: feeType.id,
        amount: schoolWideFees[name]!,
      }),
    );
  }
  logger.info('OneTime + SchoolWide fees done');

  // 2. Annual + SchoolWide (Development Levy, Medical Fee)
  for (const name of ['Development Levy', 'Medical Fee']) {
    const feeType = feeTypeMap.get(name);
    if (!feeType || !schoolWideFees[name]) continue;
    track(
      await createStructureIfNotExists({
        feeTypeId: feeType.id,
        amount: schoolWideFees[name]!,
        sessionId: session.id,
      }),
    );
  }
  logger.info('Annual + SchoolWide fees done');

  // 3. Annual + PerClass (Books, Exercise Books)
  const annualPerClass: { name: string; amounts: Record<string, number> }[] = [
    { name: 'Books', amounts: booksAmounts },
    { name: 'Exercise Books', amounts: exerciseBooksAmounts },
  ];

  for (const { name, amounts } of annualPerClass) {
    const feeType = feeTypeMap.get(name);
    if (!feeType) continue;
    for (const classLevel of classLevels) {
      const amount = amounts[classLevel.name];
      if (!amount) continue;
      track(
        await createStructureIfNotExists({
          feeTypeId: feeType.id,
          amount,
          classLevelId: classLevel.id,
          sessionId: session.id,
        }),
      );
    }
    logger.info(`${name} (Annual, PerClass) done`);
  }

  // 4. PerTerm + SchoolWide
  const perTermSchoolWide = [
    'ICT Fee',
    'Library Fee',
    'Laboratory Fee',
    'Examination Fee',
    'Sports Fee',
    'PTA Levy',
    'Transport',
    'Feeding',
    'Boarding',
  ];

  for (const term of terms) {
    for (const name of perTermSchoolWide) {
      const feeType = feeTypeMap.get(name);
      if (!feeType || !schoolWideFees[name]) continue;
      track(
        await createStructureIfNotExists({
          feeTypeId: feeType.id,
          amount: schoolWideFees[name]!,
          sessionId: session.id,
          termId: term.id,
        }),
      );
    }
    logger.info(`PerTerm + SchoolWide fees for ${term.name} term done`);
  }

  // 5. PerTerm + PerClass (Tuition)
  const tuitionFeeType = feeTypeMap.get('Tuition');
  if (tuitionFeeType) {
    for (const term of terms) {
      for (const classLevel of classLevels) {
        const amount = tuitionAmounts[classLevel.name];
        if (!amount) continue;
        track(
          await createStructureIfNotExists({
            feeTypeId: tuitionFeeType.id,
            amount,
            classLevelId: classLevel.id,
            sessionId: session.id,
            termId: term.id,
          }),
        );
      }
      logger.info(`Tuition for ${term.name} term done`);
    }
  }

  logger.info('─────────────────────────────────────────');
  logger.info(`Done.`);
  logger.info(
    `Fee types   — created: ${feeTypesCreated}, skipped: ${feeTypesSkipped}`,
  );
  logger.info(
    `Structures  — created: ${structuresCreated}, skipped: ${structuresSkipped}`,
  );
  logger.info('─────────────────────────────────────────');
}

seedFees()
  .catch((e) => {
    logger.error('Fee seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
