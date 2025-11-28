import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { errorHandler } from './middlewares/error';
import authRouter from './modules/auth/router.js';
import usersRouter from './modules/users/router.js';
import membersRouter from './modules/members/router.js';
import vehiclesRouter from './modules/vehicles/router.js';
import eventsRouter from './modules/events/router.js';
import souvenirsRouter from './modules/souvenirs/router.js';
import newsRouter from './modules/news/router.js';
import subscriptionsRouter from './modules/subscriptions/router.js';
import donationsRouter from './modules/donations/router.js';
import applicationFormsRouter from './modules/application-forms/router.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/members', membersRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/events', eventsRouter);
app.use('/api/souvenirs', souvenirsRouter);
app.use('/api/news', newsRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/application-forms', applicationFormsRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`API L.A.M.A. escuchando en puerto ${config.port}`);
});
