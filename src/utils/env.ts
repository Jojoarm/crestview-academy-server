import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
  NODE_ENV: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  FRONTEND_URL: z.url(),
  PORT: z.coerce.number().default(5000),
  BREVO_API_KEY: z.string().min(1),
  BREVO_SENDER_EMAIL: z.string().min(1),
  BREVO_SENDER_NAME: z.string().min(1),
  BREVO_RECIPIENT_EMAIL: z.string().min(1),
  SEED_ADMIN_EMAIL: z.string().min(1),
  SEED_ADMIN_PASSWORD: z.string().min(1),
  SEED_ADMIN_NAME: z.string().min(1),
});

export const env = envSchema.parse(process.env);
