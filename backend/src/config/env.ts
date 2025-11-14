import { cleanEnv, str, port, url } from 'envalid';
import * as dotenv from 'dotenv';

dotenv.config();

export const env = cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
    PORT: port({ default: 8080 }),
    
    // Firebase
    FIREBASE_PROJECT_ID: str(),
    FIREBASE_CLIENT_EMAIL: str(),
    FIREBASE_PRIVATE_KEY: str(),

    // Stripe
    STRIPE_PLATFORM_SECRET: str(),
    STRIPE_CLIENT_ID: str(),
    STRIPE_WEBHOOK_SECRET: str(),
    
    // Application
    ALLOWED_ORIGINS: str(),
    FRONTEND_BASE_URL: url(),

    // Optional
    SENTRY_DSN: str({ default: '' }),
});
