import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './config/better.auth.js';
import { errorHandler, notFound } from './middlewares/error-handler.js';
import adminRoutes from './modules/admin/routes/admin.routes.js';
import sessionRouter from './modules/admin/routes/session.routes.js';
import classRouter from './modules/admin/routes/class.routes.js';
import armRouter from './modules/admin/routes/arm.routes.js';
import subjectRouter from './modules/admin/routes/subject.routes.js';
import { env } from './utils/env.js';
import logger from './utils/logger.js';

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

app.use('/api/admin', adminRoutes);
app.use('/api/admin/sessions', sessionRouter);
app.use('/api/admin/classes', classRouter);
app.use('/api/admin/arms', armRouter);
app.use('/api/admin/subjects', subjectRouter);

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
