import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';

// ─── Subjects (NERDC Curriculum) ─────────────────────────────────────────────

const subjects = [
  // Core / Cross-cutting
  {
    name: 'English Language',
    code: 'ENG',
    description: 'English Language and Communication',
  },
  { name: 'Mathematics', code: 'MTH', description: 'Mathematics' },
  {
    name: 'Civic Education',
    code: 'CIV',
    description: 'Civic Education and National Values',
  },
  {
    name: 'Physical and Health Education',
    code: 'PHE',
    description: 'Physical and Health Education',
  },
  {
    name: 'Christian Religious Studies',
    code: 'CRS',
    description: 'Christian Religious Studies',
  },
  {
    name: 'Islamic Religious Studies',
    code: 'IRS',
    description: 'Islamic Religious Studies',
  },

  // Kindergarten / Nursery specific
  {
    name: 'Phonics and Literacy',
    code: 'PHL',
    description: 'Early literacy and phonics',
  },
  {
    name: 'Numeracy',
    code: 'NUM',
    description: 'Early numeracy and number sense',
  },
  {
    name: 'Creative Arts',
    code: 'CRA',
    description: 'Arts, crafts and creative expression',
  },
  {
    name: 'Social Habits',
    code: 'SOH',
    description: 'Social skills and good habits',
  },

  // Primary specific
  {
    name: 'Basic Science and Technology',
    code: 'BST',
    description: 'Basic Science and Technology',
  },
  {
    name: 'National Values Education',
    code: 'NVE',
    description: 'National Values, Civic, Security and Social Studies',
  },
  {
    name: 'Cultural and Creative Arts',
    code: 'CCA',
    description: 'Cultural and Creative Arts',
  },
  {
    name: 'Computer Studies',
    code: 'CMP',
    description: 'Computer Studies and ICT',
  },
  { name: 'Verbal Reasoning', code: 'VRE', description: 'Verbal Reasoning' },
  {
    name: 'Quantitative Reasoning',
    code: 'QRE',
    description: 'Quantitative Reasoning',
  },
  { name: 'French Language', code: 'FRN', description: 'French Language' },
  { name: 'Yoruba', code: 'YOR', description: 'Yoruba Language' },
  { name: 'Igbo', code: 'IGB', description: 'Igbo Language' },
  { name: 'Hausa', code: 'HAS', description: 'Hausa Language' },

  // JSS specific
  { name: 'Basic Science', code: 'BSC', description: 'Basic Science' },
  { name: 'Basic Technology', code: 'BTH', description: 'Basic Technology' },
  { name: 'Social Studies', code: 'SST', description: 'Social Studies' },
  { name: 'Business Studies', code: 'BUS', description: 'Business Studies' },
  { name: 'Home Economics', code: 'HEC', description: 'Home Economics' },
  {
    name: 'Agricultural Science',
    code: 'AGR',
    description: 'Agricultural Science',
  },
  { name: 'Fine Arts', code: 'FAR', description: 'Fine and Applied Arts' },
  { name: 'Music', code: 'MUS', description: 'Music' },

  // SSS specific
  {
    name: 'English Literature',
    code: 'LIT',
    description: 'Literature in English',
  },
  { name: 'Biology', code: 'BIO', description: 'Biology' },
  { name: 'Chemistry', code: 'CHM', description: 'Chemistry' },
  { name: 'Physics', code: 'PHY', description: 'Physics' },
  {
    name: 'Further Mathematics',
    code: 'FMT',
    description: 'Further Mathematics',
  },
  { name: 'Economics', code: 'ECO', description: 'Economics' },
  { name: 'Government', code: 'GOV', description: 'Government' },
  { name: 'Geography', code: 'GEO', description: 'Geography' },
  { name: 'Commerce', code: 'COM', description: 'Commerce' },
  { name: 'Accounting', code: 'ACC', description: 'Financial Accounting' },
  { name: 'Office Practice', code: 'OFP', description: 'Office Practice' },
  { name: 'Technical Drawing', code: 'TDR', description: 'Technical Drawing' },
  {
    name: 'Food and Nutrition',
    code: 'FDN',
    description: 'Food and Nutrition',
  },
  {
    name: 'ICT',
    code: 'ICT',
    description: 'Information and Communication Technology',
  },
] as const;

// ─── Assignments per class level ──────────────────────────────────────────────
// format: { className, subjects: [{ code, isCompulsory }] }

const assignments: {
  className: string;
  subjects: { code: string; isCompulsory: boolean }[];
}[] = [
  // ── Kindergarten ───────────────────────────────────────────────────────────
  {
    className: 'Kindergarten 1',
    subjects: [
      { code: 'PHL', isCompulsory: true },
      { code: 'NUM', isCompulsory: true },
      { code: 'CRA', isCompulsory: true },
      { code: 'SOH', isCompulsory: true },
      { code: 'PHE', isCompulsory: true },
      { code: 'CRS', isCompulsory: false },
      { code: 'IRS', isCompulsory: false },
    ],
  },
  {
    className: 'Kindergarten 2',
    subjects: [
      { code: 'PHL', isCompulsory: true },
      { code: 'NUM', isCompulsory: true },
      { code: 'CRA', isCompulsory: true },
      { code: 'SOH', isCompulsory: true },
      { code: 'PHE', isCompulsory: true },
      { code: 'CRS', isCompulsory: false },
      { code: 'IRS', isCompulsory: false },
    ],
  },

  // ── Nursery ────────────────────────────────────────────────────────────────
  {
    className: 'Nursery 1',
    subjects: [
      { code: 'PHL', isCompulsory: true },
      { code: 'NUM', isCompulsory: true },
      { code: 'CRA', isCompulsory: true },
      { code: 'SOH', isCompulsory: true },
      { code: 'ENG', isCompulsory: true },
      { code: 'PHE', isCompulsory: true },
      { code: 'CRS', isCompulsory: false },
      { code: 'IRS', isCompulsory: false },
    ],
  },
  {
    className: 'Nursery 2',
    subjects: [
      { code: 'PHL', isCompulsory: true },
      { code: 'NUM', isCompulsory: true },
      { code: 'CRA', isCompulsory: true },
      { code: 'SOH', isCompulsory: true },
      { code: 'ENG', isCompulsory: true },
      { code: 'MTH', isCompulsory: true },
      { code: 'PHE', isCompulsory: true },
      { code: 'CRS', isCompulsory: false },
      { code: 'IRS', isCompulsory: false },
    ],
  },

  // ── Primary ────────────────────────────────────────────────────────────────
  {
    className: 'Primary 1',
    subjects: [
      { code: 'ENG', isCompulsory: true },
      { code: 'MTH', isCompulsory: true },
      { code: 'BST', isCompulsory: true },
      { code: 'NVE', isCompulsory: true },
      { code: 'CCA', isCompulsory: true },
      { code: 'PHE', isCompulsory: true },
      { code: 'VRE', isCompulsory: true },
      { code: 'QRE', isCompulsory: true },
      { code: 'CRS', isCompulsory: false },
      { code: 'IRS', isCompulsory: false },
      { code: 'YOR', isCompulsory: false },
      { code: 'IGB', isCompulsory: false },
      { code: 'HAS', isCompulsory: false },
    ],
  },
  {
    className: 'Primary 2',
    subjects: [
      { code: 'ENG', isCompulsory: true },
      { code: 'MTH', isCompulsory: true },
      { code: 'BST', isCompulsory: true },
      { code: 'NVE', isCompulsory: true },
      { code: 'CCA', isCompulsory: true },
      { code: 'PHE', isCompulsory: true },
      { code: 'VRE', isCompulsory: true },
      { code: 'QRE', isCompulsory: true },
      { code: 'CRS', isCompulsory: false },
      { code: 'IRS', isCompulsory: false },
      { code: 'YOR', isCompulsory: false },
      { code: 'IGB', isCompulsory: false },
      { code: 'HAS', isCompulsory: false },
    ],
  },
  {
    className: 'Primary 3',
    subjects: [
      { code: 'ENG', isCompulsory: true },
      { code: 'MTH', isCompulsory: true },
      { code: 'BST', isCompulsory: true },
      { code: 'NVE', isCompulsory: true },
      { code: 'CCA', isCompulsory: true },
      { code: 'PHE', isCompulsory: true },
      { code: 'VRE', isCompulsory: true },
      { code: 'QRE', isCompulsory: true },
      { code: 'FRN', isCompulsory: false },
      { code: 'CRS', isCompulsory: false },
      { code: 'IRS', isCompulsory: false },
      { code: 'YOR', isCompulsory: false },
      { code: 'IGB', isCompulsory: false },
      { code: 'HAS', isCompulsory: false },
    ],
  },
  {
    className: 'Primary 4',
    subjects: [
      { code: 'ENG', isCompulsory: true },
      { code: 'MTH', isCompulsory: true },
      { code: 'BST', isCompulsory: true },
      { code: 'NVE', isCompulsory: true },
      { code: 'CCA', isCompulsory: true },
      { code: 'PHE', isCompulsory: true },
      { code: 'CMP', isCompulsory: true },
      { code: 'VRE', isCompulsory: true },
      { code: 'QRE', isCompulsory: true },
      { code: 'FRN', isCompulsory: false },
      { code: 'CRS', isCompulsory: false },
      { code: 'IRS', isCompulsory: false },
      { code: 'YOR', isCompulsory: false },
      { code: 'IGB', isCompulsory: false },
      { code: 'HAS', isCompulsory: false },
    ],
  },
  {
    className: 'Primary 5',
    subjects: [
      { code: 'ENG', isCompulsory: true },
      { code: 'MTH', isCompulsory: true },
      { code: 'BST', isCompulsory: true },
      { code: 'NVE', isCompulsory: true },
      { code: 'CCA', isCompulsory: true },
      { code: 'PHE', isCompulsory: true },
      { code: 'CMP', isCompulsory: true },
      { code: 'VRE', isCompulsory: true },
      { code: 'QRE', isCompulsory: true },
      { code: 'FRN', isCompulsory: false },
      { code: 'CRS', isCompulsory: false },
      { code: 'IRS', isCompulsory: false },
      { code: 'YOR', isCompulsory: false },
      { code: 'IGB', isCompulsory: false },
      { code: 'HAS', isCompulsory: false },
    ],
  },
  {
    className: 'Primary 6',
    subjects: [
      { code: 'ENG', isCompulsory: true },
      { code: 'MTH', isCompulsory: true },
      { code: 'BST', isCompulsory: true },
      { code: 'NVE', isCompulsory: true },
      { code: 'CCA', isCompulsory: true },
      { code: 'PHE', isCompulsory: true },
      { code: 'CMP', isCompulsory: true },
      { code: 'VRE', isCompulsory: true },
      { code: 'QRE', isCompulsory: true },
      { code: 'FRN', isCompulsory: false },
      { code: 'CRS', isCompulsory: false },
      { code: 'IRS', isCompulsory: false },
      { code: 'YOR', isCompulsory: false },
      { code: 'IGB', isCompulsory: false },
      { code: 'HAS', isCompulsory: false },
    ],
  },

  // ── JSS ────────────────────────────────────────────────────────────────────
  {
    className: 'JSS 1',
    subjects: [
      { code: 'ENG', isCompulsory: true },
      { code: 'MTH', isCompulsory: true },
      { code: 'BSC', isCompulsory: true },
      { code: 'BTH', isCompulsory: true },
      { code: 'SST', isCompulsory: true },
      { code: 'CIV', isCompulsory: true },
      { code: 'BUS', isCompulsory: true },
      { code: 'AGR', isCompulsory: true },
      { code: 'PHE', isCompulsory: true },
      { code: 'CMP', isCompulsory: true },
      { code: 'FRN', isCompulsory: true },
      { code: 'HEC', isCompulsory: false },
      { code: 'FAR', isCompulsory: false },
      { code: 'MUS', isCompulsory: false },
      { code: 'CRS', isCompulsory: false },
      { code: 'IRS', isCompulsory: false },
      { code: 'YOR', isCompulsory: false },
      { code: 'IGB', isCompulsory: false },
      { code: 'HAS', isCompulsory: false },
    ],
  },
  {
    className: 'JSS 2',
    subjects: [
      { code: 'ENG', isCompulsory: true },
      { code: 'MTH', isCompulsory: true },
      { code: 'BSC', isCompulsory: true },
      { code: 'BTH', isCompulsory: true },
      { code: 'SST', isCompulsory: true },
      { code: 'CIV', isCompulsory: true },
      { code: 'BUS', isCompulsory: true },
      { code: 'AGR', isCompulsory: true },
      { code: 'PHE', isCompulsory: true },
      { code: 'CMP', isCompulsory: true },
      { code: 'FRN', isCompulsory: true },
      { code: 'HEC', isCompulsory: false },
      { code: 'FAR', isCompulsory: false },
      { code: 'MUS', isCompulsory: false },
      { code: 'CRS', isCompulsory: false },
      { code: 'IRS', isCompulsory: false },
      { code: 'YOR', isCompulsory: false },
      { code: 'IGB', isCompulsory: false },
      { code: 'HAS', isCompulsory: false },
    ],
  },
  {
    className: 'JSS 3',
    subjects: [
      { code: 'ENG', isCompulsory: true },
      { code: 'MTH', isCompulsory: true },
      { code: 'BSC', isCompulsory: true },
      { code: 'BTH', isCompulsory: true },
      { code: 'SST', isCompulsory: true },
      { code: 'CIV', isCompulsory: true },
      { code: 'BUS', isCompulsory: true },
      { code: 'AGR', isCompulsory: true },
      { code: 'PHE', isCompulsory: true },
      { code: 'CMP', isCompulsory: true },
      { code: 'FRN', isCompulsory: true },
      { code: 'HEC', isCompulsory: false },
      { code: 'FAR', isCompulsory: false },
      { code: 'MUS', isCompulsory: false },
      { code: 'CRS', isCompulsory: false },
      { code: 'IRS', isCompulsory: false },
      { code: 'YOR', isCompulsory: false },
      { code: 'IGB', isCompulsory: false },
      { code: 'HAS', isCompulsory: false },
    ],
  },

  // ── SSS ────────────────────────────────────────────────────────────────────
  {
    className: 'SSS 1',
    subjects: [
      { code: 'ENG', isCompulsory: true },
      { code: 'MTH', isCompulsory: true },
      { code: 'CIV', isCompulsory: true },
      { code: 'PHE', isCompulsory: true },
      { code: 'BIO', isCompulsory: true },
      { code: 'CHM', isCompulsory: true },
      { code: 'PHY', isCompulsory: true },
      { code: 'ICT', isCompulsory: true },
      { code: 'LIT', isCompulsory: false },
      { code: 'FMT', isCompulsory: false },
      { code: 'ECO', isCompulsory: false },
      { code: 'GOV', isCompulsory: false },
      { code: 'GEO', isCompulsory: false },
      { code: 'COM', isCompulsory: false },
      { code: 'ACC', isCompulsory: false },
      { code: 'AGR', isCompulsory: false },
      { code: 'FDN', isCompulsory: false },
      { code: 'TDR', isCompulsory: false },
      { code: 'OFP', isCompulsory: false },
      { code: 'FRN', isCompulsory: false },
      { code: 'CRS', isCompulsory: false },
      { code: 'IRS', isCompulsory: false },
      { code: 'YOR', isCompulsory: false },
      { code: 'IGB', isCompulsory: false },
      { code: 'HAS', isCompulsory: false },
    ],
  },
  {
    className: 'SSS 2',
    subjects: [
      { code: 'ENG', isCompulsory: true },
      { code: 'MTH', isCompulsory: true },
      { code: 'CIV', isCompulsory: true },
      { code: 'PHE', isCompulsory: true },
      { code: 'BIO', isCompulsory: true },
      { code: 'CHM', isCompulsory: true },
      { code: 'PHY', isCompulsory: true },
      { code: 'ICT', isCompulsory: true },
      { code: 'LIT', isCompulsory: false },
      { code: 'FMT', isCompulsory: false },
      { code: 'ECO', isCompulsory: false },
      { code: 'GOV', isCompulsory: false },
      { code: 'GEO', isCompulsory: false },
      { code: 'COM', isCompulsory: false },
      { code: 'ACC', isCompulsory: false },
      { code: 'AGR', isCompulsory: false },
      { code: 'FDN', isCompulsory: false },
      { code: 'TDR', isCompulsory: false },
      { code: 'OFP', isCompulsory: false },
      { code: 'FRN', isCompulsory: false },
      { code: 'CRS', isCompulsory: false },
      { code: 'IRS', isCompulsory: false },
      { code: 'YOR', isCompulsory: false },
      { code: 'IGB', isCompulsory: false },
      { code: 'HAS', isCompulsory: false },
    ],
  },
  {
    className: 'SSS 3',
    subjects: [
      { code: 'ENG', isCompulsory: true },
      { code: 'MTH', isCompulsory: true },
      { code: 'CIV', isCompulsory: true },
      { code: 'PHE', isCompulsory: true },
      { code: 'BIO', isCompulsory: true },
      { code: 'CHM', isCompulsory: true },
      { code: 'PHY', isCompulsory: true },
      { code: 'ICT', isCompulsory: true },
      { code: 'LIT', isCompulsory: false },
      { code: 'FMT', isCompulsory: false },
      { code: 'ECO', isCompulsory: false },
      { code: 'GOV', isCompulsory: false },
      { code: 'GEO', isCompulsory: false },
      { code: 'COM', isCompulsory: false },
      { code: 'ACC', isCompulsory: false },
      { code: 'AGR', isCompulsory: false },
      { code: 'FDN', isCompulsory: false },
      { code: 'TDR', isCompulsory: false },
      { code: 'OFP', isCompulsory: false },
      { code: 'FRN', isCompulsory: false },
      { code: 'CRS', isCompulsory: false },
      { code: 'IRS', isCompulsory: false },
      { code: 'YOR', isCompulsory: false },
      { code: 'IGB', isCompulsory: false },
      { code: 'HAS', isCompulsory: false },
    ],
  },
];

async function seedSubjects() {
  logger.info('Clearing existing subject assignments and subjects...');
  await prisma.subjectAssignment.deleteMany();
  await prisma.subject.deleteMany();
  logger.info('Cleared.');

  // ── Create all subjects ───────────────────────────────────────────────────
  logger.info('Creating subjects...');

  await prisma.subject.createMany({
    data: subjects.map((s) => ({
      name: s.name,
      code: s.code,
      description: s.description,
    })),
  });

  const createdSubjects = await prisma.subject.findMany();
  const subjectMap = new Map(createdSubjects.map((s) => [s.code, s.id]));
  logger.info(`Created ${createdSubjects.length} subjects.`);

  // ── Assign subjects to class levels ───────────────────────────────────────
  logger.info('Assigning subjects to class levels...');

  let assignmentCount = 0;
  let skippedClasses = 0;

  for (const assignment of assignments) {
    const classLevel = await prisma.classLevel.findFirst({
      where: { name: assignment.className },
    });

    if (!classLevel) {
      logger.warn(
        `Class "${assignment.className}" not found — skipping assignments for it`,
      );
      skippedClasses++;
      continue;
    }

    const assignmentData = assignment.subjects
      .map(({ code, isCompulsory }) => {
        const subjectId = subjectMap.get(code);
        if (!subjectId) {
          logger.warn(`Subject code "${code}" not found — skipping`);
          return null;
        }
        return {
          subjectId,
          classLevelId: classLevel.id,
          isCompulsory,
        };
      })
      .filter((a): a is NonNullable<typeof a> => a !== null);

    await prisma.subjectAssignment.createMany({ data: assignmentData });
    assignmentCount += assignmentData.length;

    logger.info(
      `Assigned ${assignmentData.length} subjects to ${assignment.className}`,
    );
  }

  logger.info('─────────────────────────────────────────');
  logger.info(`Done.`);
  logger.info(`Subjects created:      ${createdSubjects.length}`);
  logger.info(`Assignments created:   ${assignmentCount}`);
  if (skippedClasses > 0)
    logger.warn(`Classes not found:     ${skippedClasses}`);
  logger.info('─────────────────────────────────────────');
}

seedSubjects()
  .catch((e) => {
    logger.error('Subject seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
