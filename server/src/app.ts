// Sets up the Express app, global middleware, API routes, and error handling.
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import config from './config/config';

import authRouter from './routes/auth.routes';
import applicationRouter from './routes/applications.routes';
import statsRouter from './routes/stats.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/stats", statsRouter);

// Error middleware must be mounted after all routes
app.use(errorMiddleware);

export default app;