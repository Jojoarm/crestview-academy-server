import winston from 'winston';
import 'winston-daily-rotate-file';
import { env } from './env.js';

const {
  combine,
  timestamp,
  json,
  prettyPrint,
  errors,
  splat,
  colorize,
  simple,
} = winston.format;

// Create a daily rotate transport for errors
const errorTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

// Create a daily rotate transport for combined logs
const combinedTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    splat(),
    json(),
    prettyPrint(),
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), simple()),
    }),
    ...(env.NODE_ENV !== 'production'
      ? [errorTransport, combinedTransport]
      : []),
  ],
});

export default logger;
