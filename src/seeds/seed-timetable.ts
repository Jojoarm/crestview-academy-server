import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';

// ─── Period Slots for Secondary section ──────────────────────────────────────

const secondaryPeriods = [
  {
    name: 'Period 1',
    startTime: '08:00',
    endTime: '08:40',
    order: 1,
    isBreak: false,
  },
  {
    name: 'Period 2',
    startTime: '08:40',
    endTime: '09:20',
    order: 2,
    isBreak: false,
  },
  {
    name: 'Period 3',
    startTime: '09:20',
    endTime: '10:00',
    order: 3,
    isBreak: false,
  },
  {
    name: 'Short Break',
    startTime: '10:00',
    endTime: '10:20',
    order: 4,
    isBreak: true,
  },
  {
    name: 'Period 4',
    startTime: '10:20',
    endTime: '11:00',
    order: 5,
    isBreak: false,
  },
  {
    name: 'Period 5',
    startTime: '11:00',
    endTime: '11:40',
    order: 6,
    isBreak: false,
  },
  {
    name: 'Period 6',
    startTime: '11:40',
    endTime: '12:20',
    order: 7,
    isBreak: false,
  },
  {
    name: 'Lunch Break',
    startTime: '12:20',
    endTime: '13:00',
    order: 8,
    isBreak: true,
  },
  {
    name: 'Period 7',
    startTime: '13:00',
    endTime: '13:40',
    order: 9,
    isBreak: false,
  },
  {
    name: 'Period 8',
    startTime: '13:40',
    endTime: '14:20',
    order: 10,
    isBreak: false,
  },
];

const primaryPeriods = [
  {
    name: 'Period 1',
    startTime: '08:00',
    endTime: '08:45',
    order: 1,
    isBreak: false,
  },
  {
    name: 'Period 2',
    startTime: '08:45',
    endTime: '09:30',
    order: 2,
    isBreak: false,
  },
  {
    name: 'Period 3',
    startTime: '09:30',
    endTime: '10:15',
    order: 3,
    isBreak: false,
  },
  {
    name: 'Short Break',
    startTime: '10:15',
    endTime: '10:35',
    order: 4,
    isBreak: true,
  },
  {
    name: 'Period 4',
    startTime: '10:35',
    endTime: '11:20',
    order: 5,
    isBreak: false,
  },
  {
    name: 'Period 5',
    startTime: '11:20',
    endTime: '12:05',
    order: 6,
    isBreak: false,
  },
  {
    name: 'Lunch Break',
    startTime: '12:05',
    endTime: '12:45',
    order: 7,
    isBreak: true,
  },
  {
    name: 'Period 6',
    startTime: '12:45',
    endTime: '13:30',
    order: 8,
    isBreak: false,
  },
];

const nurseryPeriods = [
  {
    name: 'Period 1',
    startTime: '08:00',
    endTime: '08:50',
    order: 1,
    isBreak: false,
  },
  {
    name: 'Period 2',
    startTime: '08:50',
    endTime: '09:40',
    order: 2,
    isBreak: false,
  },
  {
    name: 'Short Break',
    startTime: '09:40',
    endTime: '10:00',
    order: 3,
    isBreak: true,
  },
  {
    name: 'Period 3',
    startTime: '10:00',
    endTime: '10:50',
    order: 4,
    isBreak: false,
  },
  {
    name: 'Period 4',
    startTime: '10:50',
    endTime: '11:40',
    order: 5,
    isBreak: false,
  },
  {
    name: 'Lunch Break',
    startTime: '11:40',
    endTime: '12:10',
    order: 6,
    isBreak: true,
  },
  {
    name: 'Period 5',
    startTime: '12:10',
    endTime: '13:00',
    order: 7,
    isBreak: false,
  },
];

const kindergartenPeriods = [
  {
    name: 'Period 1',
    startTime: '08:00',
    endTime: '09:00',
    order: 1,
    isBreak: false,
  },
  {
    name: 'Period 2',
    startTime: '09:00',
    endTime: '10:00',
    order: 2,
    isBreak: false,
  },
  {
    name: 'Short Break',
    startTime: '10:00',
    endTime: '10:20',
    order: 3,
    isBreak: true,
  },
  {
    name: 'Period 3',
    startTime: '10:20',
    endTime: '11:20',
    order: 4,
    isBreak: false,
  },
  {
    name: 'Period 4',
    startTime: '11:20',
    endTime: '12:20',
    order: 5,
    isBreak: false,
  },
];

// ─── JSS 1A Timetable entries ─────────────────────────────────────────────────
// Format: { day, periodOrder, subjectCode }
// null subjectCode = break period (isBreak: true)

const jss1ATimetable: {
  day: string;
  periodOrder: number;
  subjectCode: string | null;
}[] = [
  // Monday
  { day: 'Monday', periodOrder: 1, subjectCode: 'MTH' },
  { day: 'Monday', periodOrder: 2, subjectCode: 'ENG' },
  { day: 'Monday', periodOrder: 3, subjectCode: 'BSC' },
  { day: 'Monday', periodOrder: 4, subjectCode: null }, // Short Break
  { day: 'Monday', periodOrder: 5, subjectCode: 'SST' },
  { day: 'Monday', periodOrder: 6, subjectCode: 'BTH' },
  { day: 'Monday', periodOrder: 7, subjectCode: 'CIV' },
  { day: 'Monday', periodOrder: 8, subjectCode: null }, // Lunch Break
  { day: 'Monday', periodOrder: 9, subjectCode: 'AGR' },
  { day: 'Monday', periodOrder: 10, subjectCode: 'PHE' },

  // Tuesday
  { day: 'Tuesday', periodOrder: 1, subjectCode: 'ENG' },
  { day: 'Tuesday', periodOrder: 2, subjectCode: 'MTH' },
  { day: 'Tuesday', periodOrder: 3, subjectCode: 'BUS' },
  { day: 'Tuesday', periodOrder: 4, subjectCode: null },
  { day: 'Tuesday', periodOrder: 5, subjectCode: 'FRN' },
  { day: 'Tuesday', periodOrder: 6, subjectCode: 'CMP' },
  { day: 'Tuesday', periodOrder: 7, subjectCode: 'BSC' },
  { day: 'Tuesday', periodOrder: 8, subjectCode: null },
  { day: 'Tuesday', periodOrder: 9, subjectCode: 'MTH' },
  { day: 'Tuesday', periodOrder: 10, subjectCode: 'ENG' },

  // Wednesday
  { day: 'Wednesday', periodOrder: 1, subjectCode: 'SST' },
  { day: 'Wednesday', periodOrder: 2, subjectCode: 'CIV' },
  { day: 'Wednesday', periodOrder: 3, subjectCode: 'MTH' },
  { day: 'Wednesday', periodOrder: 4, subjectCode: null },
  { day: 'Wednesday', periodOrder: 5, subjectCode: 'ENG' },
  { day: 'Wednesday', periodOrder: 6, subjectCode: 'AGR' },
  { day: 'Wednesday', periodOrder: 7, subjectCode: 'BTH' },
  { day: 'Wednesday', periodOrder: 8, subjectCode: null },
  { day: 'Wednesday', periodOrder: 9, subjectCode: 'BUS' },
  { day: 'Wednesday', periodOrder: 10, subjectCode: 'PHE' },

  // Thursday
  { day: 'Thursday', periodOrder: 1, subjectCode: 'MTH' },
  { day: 'Thursday', periodOrder: 2, subjectCode: 'BSC' },
  { day: 'Thursday', periodOrder: 3, subjectCode: 'ENG' },
  { day: 'Thursday', periodOrder: 4, subjectCode: null },
  { day: 'Thursday', periodOrder: 5, subjectCode: 'CMP' },
  { day: 'Thursday', periodOrder: 6, subjectCode: 'FRN' },
  { day: 'Thursday', periodOrder: 7, subjectCode: 'SST' },
  { day: 'Thursday', periodOrder: 8, subjectCode: null },
  { day: 'Thursday', periodOrder: 9, subjectCode: 'CIV' },
  { day: 'Thursday', periodOrder: 10, subjectCode: 'BTH' },

  // Friday
  { day: 'Friday', periodOrder: 1, subjectCode: 'ENG' },
  { day: 'Friday', periodOrder: 2, subjectCode: 'MTH' },
  { day: 'Friday', periodOrder: 3, subjectCode: 'PHE' },
  { day: 'Friday', periodOrder: 4, subjectCode: null },
  { day: 'Friday', periodOrder: 5, subjectCode: 'BUS' },
  { day: 'Friday', periodOrder: 6, subjectCode: 'AGR' },
  { day: 'Friday', periodOrder: 7, subjectCode: 'BSC' },
  { day: 'Friday', periodOrder: 8, subjectCode: null },
  { day: 'Friday', periodOrder: 9, subjectCode: 'FRN' },
  { day: 'Friday', periodOrder: 10, subjectCode: 'CMP' },
];

async function seedTimetable() {
  logger.info('Clearing existing timetable entries and period slots...');
  await prisma.timetableEntry.deleteMany();
  await prisma.periodSlot.deleteMany();
  logger.info('Cleared.');

  // ── Create period slots for all sections ──────────────────────────────────
  logger.info('Creating period slots...');

  const sectionPeriods = [
    { section: 'Kindergarten' as const, periods: kindergartenPeriods },
    { section: 'Nursery' as const, periods: nurseryPeriods },
    { section: 'Primary' as const, periods: primaryPeriods },
    { section: 'Secondary' as const, periods: secondaryPeriods },
  ];

  const periodSlotMap = new Map<string, string>(); // "Secondary-1" -> id

  for (const { section, periods } of sectionPeriods) {
    for (const period of periods) {
      const slot = await prisma.periodSlot.create({
        data: {
          section,
          name: period.name,
          startTime: period.startTime,
          endTime: period.endTime,
          order: period.order,
          isBreak: period.isBreak,
        },
      });
      periodSlotMap.set(`${section}-${period.order}`, slot.id);
    }
    logger.info(`Created ${periods.length} period slots for ${section}`);
  }

  // ── Find JSS 1A ───────────────────────────────────────────────────────────
  const jss1 = await prisma.classLevel.findFirst({ where: { name: 'JSS 1' } });
  if (!jss1) throw new Error('JSS 1 not found. Run seed:classes first.');

  const armA = await prisma.arm.findFirst({ where: { name: 'A' } });
  if (!armA) throw new Error('Arm A not found.');

  const jss1A = await prisma.classArm.findFirst({
    where: { classLevelId: jss1.id, armId: armA.id },
  });
  if (!jss1A) throw new Error('JSS 1A not found.');

  // ── Get active session ────────────────────────────────────────────────────
  const session = await prisma.academicSession.findFirst({
    where: { isActive: true },
  });
  if (!session) throw new Error('No active session found.');

  // ── Get subjects for JSS 1 ────────────────────────────────────────────────
  const subjectAssignments = await prisma.subjectAssignment.findMany({
    where: { classLevelId: jss1.id },
    include: { subject: true },
  });
  const subjectMap = new Map(
    subjectAssignments.map((sa) => [sa.subject.code, sa.subject.id]),
  );

  // ── Create timetable entries ───────────────────────────────────────────────
  logger.info('Creating JSS 1A timetable entries...');
  let entryCount = 0;
  let skipped = 0;

  for (const entry of jss1ATimetable) {
    const slotId = periodSlotMap.get(`Secondary-${entry.periodOrder}`);
    if (!slotId) {
      logger.warn(`Period slot not found for order ${entry.periodOrder}`);
      skipped++;
      continue;
    }

    // Break periods
    if (entry.subjectCode === null) {
      await prisma.timetableEntry.create({
        data: {
          classArmId: jss1A.id,
          periodSlotId: slotId,
          dayOfWeek: entry.day as any,
          subjectId: null,
          sessionId: session.id,
        },
      });
      entryCount++;
      continue;
    }

    const subjectId = subjectMap.get(entry.subjectCode);
    if (!subjectId) {
      logger.warn(
        `Subject ${entry.subjectCode} not found for JSS 1 — skipping`,
      );
      skipped++;
      continue;
    }

    await prisma.timetableEntry.create({
      data: {
        classArmId: jss1A.id,
        periodSlotId: slotId,
        dayOfWeek: entry.day as any,
        subjectId,
        sessionId: session.id,
      },
    });
    entryCount++;
  }

  logger.info('─────────────────────────────────────────');
  logger.info(`Done.`);
  logger.info(`Period slots created:     ${periodSlotMap.size}`);
  logger.info(`Timetable entries created: ${entryCount}`);
  if (skipped > 0) logger.warn(`Entries skipped:          ${skipped}`);
  logger.info(`Class arm:                JSS 1A`);
  logger.info(`Session:                  ${session.name}`);
  logger.info('─────────────────────────────────────────');
}

seedTimetable()
  .catch((e) => {
    logger.error('Timetable seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
