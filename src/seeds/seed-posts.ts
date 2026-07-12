import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';

const posts = [
  // ── Announcements ─────────────────────────────────────────────────────────
  {
    title: 'Resumption Date for Second Term 2025/2026',
    content:
      'Dear Parents and Guardians, this is to inform you that the second term will commence on Monday, January 6th, 2026. All students are expected to resume on this date. Late resumption will not be tolerated. Thank you for your continued support.',
    type: 'Announcement' as const,
    audience: 'Everyone' as const,
    status: 'Published' as const,
  },
  {
    title: 'New School Bus Route — Lekki Phase 2',
    content:
      'We are pleased to announce the addition of a new school bus route covering Lekki Phase 2 and environs. Parents interested in this service should contact the school bursar for pricing and registration details.',
    type: 'Announcement' as const,
    audience: 'Parents' as const,
    status: 'Published' as const,
  },
  {
    title: 'Staff Professional Development Training',
    content:
      'All teaching staff are required to attend the professional development training scheduled for Saturday, December 14th, 2025. Venue is the school assembly hall. Attendance is compulsory. Please see the VP Academics for details.',
    type: 'Announcement' as const,
    audience: 'Teachers' as const,
    status: 'Published' as const,
  },
  {
    title: 'Reminder: Second Term Fee Payment Deadline',
    content:
      'This is a reminder that the deadline for second term fee payment is December 20th, 2025. Students whose fees are not paid in full by this date may not be allowed to resume for second term. Please contact the bursar for payment options.',
    type: 'Announcement' as const,
    audience: 'Parents' as const,
    status: 'Published' as const,
  },
  {
    title: 'Change of School Closing Time',
    content:
      'Please note that effective January 2026, the school closing time for Primary classes will change from 2:00pm to 2:30pm. Secondary classes remain at 3:30pm. Parents should update their pickup arrangements accordingly.',
    type: 'Announcement' as const,
    audience: 'Everyone' as const,
    status: 'Draft' as const,
  },

  // ── News ──────────────────────────────────────────────────────────────────
  {
    title: 'Crestview Academy Wins State Mathematics Olympiad',
    content:
      'We are proud to announce that our students from JSS 3 and SSS 2 emerged victorious at the Lagos State Mathematics Olympiad held last week at Kings College, Lagos. Taiwo Fashola won first place in the junior category while Emeka Nwosu placed second in the senior category. Congratulations to our students and their teachers!',
    type: 'News' as const,
    audience: 'Everyone' as const,
    status: 'Published' as const,
  },
  {
    title: 'School Receives ISO Quality Management Certification',
    content:
      'Crestview Academy is delighted to announce the receipt of the ISO 9001:2015 Quality Management System certification. This achievement reflects our commitment to providing world-class education and maintaining the highest standards in all our processes. We thank our dedicated staff, supportive parents, and hardworking students for making this possible.',
    type: 'News' as const,
    audience: 'Everyone' as const,
    status: 'Published' as const,
  },
  {
    title: 'New Science Laboratory Equipment Installed',
    content:
      'The school has completed the installation of brand new laboratory equipment in all three science labs — Biology, Chemistry, and Physics. The new equipment includes digital microscopes, advanced titration kits, and modern physics demonstration apparatus. Secondary students will begin using the new equipment next term.',
    type: 'News' as const,
    audience: 'Everyone' as const,
    status: 'Published' as const,
  },
  {
    title: 'First Term Examination Results Released',
    content:
      "First term examination results have been compiled and are now available for collection at the school office. Parents are advised to come in person with a valid ID to collect their ward's result. Results can also be viewed on the parent portal. Any queries should be directed to the class teacher.",
    type: 'News' as const,
    audience: 'Parents' as const,
    status: 'Published' as const,
  },

  // ── Events ────────────────────────────────────────────────────────────────
  {
    title: 'Annual Inter-House Sports Competition 2026',
    content:
      'The annual inter-house sports competition is here again! Students will compete in track and field events, football, basketball, table tennis, and swimming. Parents are warmly invited to come cheer their children. Refreshments will be available. Wear your house colours!',
    type: 'Event' as const,
    audience: 'Everyone' as const,
    status: 'Published' as const,
    eventStartDate: new Date('2026-03-14'),
    eventEndDate: new Date('2026-03-15'),
  },
  {
    title: 'PTA General Meeting — Second Term',
    content:
      'The second term PTA general meeting will hold as scheduled. Agenda includes: review of first term academic performance, second term fee structure update, school improvement projects, and any other business. All parents and guardians are strongly encouraged to attend.',
    type: 'Event' as const,
    audience: 'Parents' as const,
    status: 'Published' as const,
    eventStartDate: new Date('2026-02-07'),
    eventEndDate: new Date('2026-02-07'),
  },
  {
    title: 'Cultural Day & Food Fair',
    content:
      "Celebrate our rich Nigerian heritage at this year's Cultural Day and Food Fair! Students are encouraged to come dressed in their cultural attires and bring traditional dishes to share. There will be cultural performances, traditional games, and prizes for best costume. A day to remember!",
    type: 'Event' as const,
    audience: 'Everyone' as const,
    status: 'Published' as const,
    eventStartDate: new Date('2026-02-27'),
    eventEndDate: new Date('2026-02-27'),
  },
  {
    title: 'Career Day 2026 — Discover Your Future',
    content:
      'Crestview Academy invites parents and professionals to participate in our annual Career Day. Professionals from medicine, law, engineering, technology, business, and the arts will speak to our SSS students about career paths and opportunities. If you would like to speak at this event, please contact the VP Student Affairs.',
    type: 'Event' as const,
    audience: 'Everyone' as const,
    status: 'Draft' as const,
    eventStartDate: new Date('2026-04-03'),
    eventEndDate: new Date('2026-04-03'),
  },
  {
    title: 'Third Term Resumption & Valedictory Service',
    content:
      'Third term resumes on Tuesday, April 21st, 2026. The valedictory service for graduating SSS 3 students will hold on Friday, July 10th, 2026. Parents of graduating students should look out for further details regarding the valedictory ceremony.',
    type: 'Event' as const,
    audience: 'Everyone' as const,
    status: 'Draft' as const,
    eventStartDate: new Date('2026-04-21'),
    eventEndDate: new Date('2026-07-10'),
  },
];

async function seedPosts() {
  logger.info('Clearing existing posts...');
  await prisma.post.deleteMany();
  logger.info('Cleared.');

  // ── Find an admin to be the author ────────────────────────────────────────
  const admin = await prisma.admin.findFirst({
    include: { user: true },
  });
  if (!admin) throw new Error('No admin found. Run seed:admin first.');

  logger.info(`Using author: ${admin.user.name}`);
  logger.info('Creating posts...');

  let created = 0;

  for (const post of posts) {
    await prisma.post.create({
      data: {
        title: post.title,
        content: post.content,
        type: post.type,
        audience: post.audience,
        status: post.status,
        authorId: admin.id,
        publishedAt: post.status === 'Published' ? new Date() : null,
        eventStartDate:
          'eventStartDate' in post ? (post.eventStartDate ?? null) : null,
        eventEndDate:
          'eventEndDate' in post ? (post.eventEndDate ?? null) : null,
      },
    });
    created++;
    logger.info(`Created [${post.type}]: ${post.title}`);
  }

  logger.info('─────────────────────────────────────────');
  logger.info(`Done. Created ${created} posts.`);
  logger.info(
    `  Announcements: ${posts.filter((p) => p.type === 'Announcement').length}`,
  );
  logger.info(
    `  News:          ${posts.filter((p) => p.type === 'News').length}`,
  );
  logger.info(
    `  Events:        ${posts.filter((p) => p.type === 'Event').length}`,
  );
  logger.info(
    `  Published:     ${posts.filter((p) => p.status === 'Published').length}`,
  );
  logger.info(
    `  Drafts:        ${posts.filter((p) => p.status === 'Draft').length}`,
  );
  logger.info('─────────────────────────────────────────');
}

seedPosts()
  .catch((e) => {
    logger.error('Posts seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
