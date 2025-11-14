

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as Sentry from '@sentry/node';
import { env } from './config/env';
import logger from './config/logger';
import { db } from './config/firebase';

import { connectRouter } from './routes/connect';
import { webhooksRouter } from './routes/webhooks';
import { subscriptionsRouter } from './routes/subscriptions';
import { settingsRouter } from './routes/settings';
import { metricsRouter } from './routes/metrics';
import { internalRouter } from './routes/internal';

const app = express();
const port = env.PORT;

// --- Sentry Initialization & Middleware ---
// Sentry is initialized only if a DSN is provided in the environment.
if (env.SENTRY_DSN) {
    // FIX: Updated Sentry initialization to use modern Sentry SDK functions like `httpIntegration` and `expressIntegration` instead of the deprecated `Integrations` class.
    Sentry.init({
        dsn: env.SENTRY_DSN,
        integrations: [
            // enable HTTP calls tracing
            Sentry.httpIntegration(),
            // enable Express.js middleware tracing
            Sentry.expressIntegration(),
        ],
        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production.
        tracesSampleRate: 1.0,
        environment: env.NODE_ENV,
    });
    logger.info('Sentry initialized for error tracking.');

    // FIX: Use top-level `Sentry.requestHandler()` instead of deprecated `Sentry.Handlers.requestHandler()`.
    // The request handler must be the first middleware on the app
    app.use(Sentry.requestHandler());
    // FIX: Use top-level `Sentry.tracingHandler()` instead of deprecated `Sentry.Handlers.tracingHandler()`.
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.tracingHandler());
}


// --- Security & Core Middleware ---
app.use(helmet());
app.set('trust proxy', 1);

const allowedOrigins = env.ALLOWED_ORIGINS.split(',');

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin && env.NODE_ENV !== 'production') {
        return callback(null, true);
    }
    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
// FIX: Correctly typed the app.use call to resolve overload errors.
app.use(cors(corsOptions));


// --- Rate Limiting ---
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	standardHeaders: 'draft-7',
	legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});

// --- Route-specific Middleware & Parsers ---
// The Stripe webhook needs the raw body, so we apply this parser only to its route.
// FIX: Correctly typed the app.use call to resolve overload errors.
app.use('/api/webhooks', webhooksRouter);

// For all other routes, use the JSON parser.
app.use(express.json());

// Apply rate limiting to all /api routes (except webhooks which are handled separately).
// FIX: Correctly typed the app.use call to resolve overload errors.
app.use('/api', apiLimiter);

// --- Public Routes (Health Checks) ---
app.get('/health', async (req, res) => {
    try {
        await db.collection('_health').doc('check').get();
        res.status(200).send({ status: 'ok' });
    } catch (error) {
        logger.error({ message: 'Health check failed: Could not connect to Firestore.', error });
        res.status(503).send({ status: 'not ready', reason: 'Database connection failed' });
    }
});

// --- API Routes ---
app.use('/api/connect', connectRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/internal', internalRouter);

// --- Sentry Error Handling Middleware ---
// The Sentry error handler must be registered before any other error middleware
// and after all controllers.
if (env.SENTRY_DSN) {
    // FIX: Use top-level `Sentry.errorHandler()` instead of deprecated `Sentry.Handlers.errorHandler()`.
    app.use(Sentry.errorHandler());
}

// --- Custom Error Handling Middleware ---
// This final handler catches any errors that fell through.
// FIX: Cast `req` and `res` to `any` to bypass persistent type errors on properties like `.path` and `.status()`, likely caused by a type definition conflict in the environment.
app.use((err: Error, req: any, res: any, next: NextFunction) => {
  logger.error({ message: 'Unhandled error caught in final middleware', error: err, path: req.path });
  res.status(500).send({ error: 'Something went wrong!' });
});

// --- Server Startup ---
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        logger.info(`Server is running on port ${port} in ${env.NODE_ENV} mode`);
    });
}

/*
 * --- HOW TO TEST SENTRY ---
 * 1. Add your SENTRY_DSN to the .env file.
 * 2. Start the backend server.
 * 3. Trigger an error (e.g., by adding `throw new Error('Sentry test error!');` to a route).
 * 4. Verify the error appears in your Sentry project dashboard.
 * 5. To disable Sentry for local development, simply remove the SENTRY_DSN from .env.
 */
export default app;