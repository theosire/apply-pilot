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
import aiRouter from './routes/ai.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

app.use(helmet());

const allowedOrigins = [
    config.clientUrl,
    "http://localhost:5173",
].filter(Boolean);

app.use(
    cors({ 
        origin: allowedOrigins, 
        credentials: true 
    })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/stats", statsRouter);
app.use("/api/ai", aiRouter);

// Error middleware must be mounted after all routes
app.use(errorMiddleware);

export default app;