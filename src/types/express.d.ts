import { User, Session } from '@prisma/client';

// Extend Express Request to include our custom properties
// so TypeScript knows req.user, req.session exist
declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: Session;
    }
  }
}

export {};
