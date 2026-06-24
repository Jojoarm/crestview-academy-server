import { User, Session, Admin } from '@prisma/client';

// Extend Express Request to include our custom properties
// so TypeScript knows req.user, req.session, req.admin exist
declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: Session;
      admin?: Admin & { user: User };
    }
  }
}

export {};
