import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import prisma from './prisma.js';
import redisClient from './redis.client.js';
import { env } from '../utils/env.js';
import { sendPasswordResetEmail } from '../utils/mailer.js';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  // using upstash redis for server-side session storage
  secondaryStorage: {
    get: async (key) => {
      const value = await redisClient.get<string>(key);
      return value ?? null;
    },
    set: async (key, value, ttl) => {
      if (ttl) {
        await redisClient.set(key, value, { ex: ttl });
      } else {
        await redisClient.set(key, value);
      }
    },
    delete: async (key) => {
      await redisClient.del(key);
    },
  },

  emailAndPassword: {
    enabled: true,

    // Forgot password flow — sends reset link via Brevo
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        url,
      });
    },
  },

  // Better Auth admin plugin — handles role management, ban, impersonation
  plugins: [admin()],

  // additional fields to be shown
  user: {
    additionalFields: {
      userRole: {
        type: 'string',
        required: false,
        input: false,
      },
      forcePasswordChange: {
        type: 'boolean',
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // cache for 5 minutes
    },
  },

  advanced: {
    // crossSubdomainCookies: {
    //   enabled: true,
    // },
    defaultCookieAttributes: {
      // sameSite: 'none',
      sameSite: 'lax',
      secure: true,
    },
  },

  trustedOrigins: [env.FRONTEND_URL],
});

export type Auth = typeof auth;
