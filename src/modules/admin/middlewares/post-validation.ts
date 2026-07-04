import { z } from 'zod';

// Enums
export const postTypeEnum = z.enum(['Announcement', 'News', 'Event'], {
  error: 'Type must be Announcement, News, or Event',
});

export const postAudienceEnum = z.enum(
  ['Everyone', 'Teachers', 'Parents', 'Students', 'Admins'],
  {
    error: 'Audience must be Everyone, Teachers, Parents, Students or Admins',
  },
);

export const postStatusEnum = z.enum(['Draft', 'Published'], {
  error: 'Status must be Draft or Published',
});

// Create / Update Schemas

export const createPostSchema = z
  .object({
    title: z.string('Title is required').min(1, 'Title cannot be empty').trim(),
    content: z
      .string('Content is required')
      .min(1, 'Content cannot be empty')
      .trim(),
    type: postTypeEnum,
    audience: postAudienceEnum.default('Everyone'),
    status: postStatusEnum.default('Draft'),
    bannerImageUrl: z.url('Banner image must be a valid URL').optional(),
    eventStartDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid event start date',
      })
      .transform((val) => new Date(val))
      .optional(),
    eventEndDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid event end date',
      })
      .transform((val) => new Date(val))
      .optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'Event') return !!data.eventStartDate;
      return true;
    },
    {
      message: 'Event start date is required for posts of type Event',
      path: ['eventStartDate'],
    },
  )
  .refine(
    (data) => {
      if (data.eventStartDate && data.eventEndDate) {
        return data.eventEndDate >= data.eventStartDate;
      }
      return true;
    },
    {
      message: 'Event end date must be on or after the start date',
      path: ['eventEndDate'],
    },
  );

export const updatePostSchema = z
  .object({
    title: z.string().min(1, 'Title cannot be empty').trim().optional(),
    content: z.string().min(1, 'Content cannot be empty').trim().optional(),
    type: postTypeEnum.optional(),
    audience: postAudienceEnum.optional(),
    bannerImageUrl: z.url('Banner image must be a valid URL').optional(),
    eventStartDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid event start date',
      })
      .transform((val) => new Date(val))
      .optional(),
    eventEndDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid event end date',
      })
      .transform((val) => new Date(val))
      .optional(),
  })
  .refine(
    (data) => {
      if (data.eventStartDate && data.eventEndDate) {
        return data.eventEndDate >= data.eventStartDate;
      }
      return true;
    },
    {
      message: 'Event end date must be on or after the start date',
      path: ['eventEndDate'],
    },
  );

export const postQuerySchema = z.object({
  search: z.string().optional(),
  type: postTypeEnum.optional(),
  status: postStatusEnum.optional(),
  audience: postAudienceEnum.optional(),
});

// Types

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostQuery = z.infer<typeof postQuerySchema>;
