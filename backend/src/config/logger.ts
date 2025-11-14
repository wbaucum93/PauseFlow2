import winston from 'winston';

const { combine, timestamp, json, errors } = winston.format;

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    errors({ stack: true }), // Log stack traces
    timestamp(),
    json()
  ),
  defaultMeta: { service: 'pauseflow-backend' },
  transports: [
    // In a production environment, you might want to add other transports
    // for services like Sentry, Datadog, etc.
    new winston.transports.Console(),
  ],
});

export default logger;
