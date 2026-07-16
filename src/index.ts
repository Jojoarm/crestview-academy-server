import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './config/better.auth.js';
import { errorHandler, notFound } from './middlewares/error-handler.js';
import adminRouter from './modules/admin/index.js';
import authRouter from './modules/auth/index.js';
import { env } from './utils/env.js';
import logger from './utils/logger.js';
import teacherRouter from './modules/teacher/index.js';

const app = express();
const PORT = env.PORT;

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

// Better Auth - Handles all /api/auth/* routes (login, logout, verify, reset-password etc.)
app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/admin', adminRouter);
app.use('/api/profile', authRouter);
app.use('/api/teacher', teacherRouter);

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});

export default app;
