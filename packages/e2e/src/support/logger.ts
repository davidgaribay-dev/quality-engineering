import { createLogger, format, transports, type Logger } from 'winston';
import { env } from './env.js';

const { combine, timestamp, colorize, printf, json, errors } = format;

/**
 * Human-readable, colorized line for the console. Pulls a `test` field (set by
 * the per-test child logger in fixtures.ts) into the prefix, and dumps any
 * remaining metadata as compact JSON.
 */
const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss.SSS' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, test, ...meta }) => {
    const ctx = test ? ` [${String(test)}]` : '';
    const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} ${level}:${ctx} ${message as string}${rest}`;
  })
);

/** Structured JSON for the file transport — machine-parseable / CI-friendly. */
const fileFormat = combine(timestamp(), errors({ stack: true }), json());

/**
 * Shared root logger. Use `logger.child({ test })` (see the `log` fixture) to
 * stamp per-test context onto every line. Level is env-driven (LOG_LEVEL),
 * defaulting to `info`. Winston ships its own types — no @types needed.
 */
export const logger: Logger = createLogger({
  level: env.logLevel,
  transports: [
    new transports.Console({ format: consoleFormat }),
    new transports.File({
      filename: 'logs/test-run.log',
      format: fileFormat,
    }),
  ],
});

export type { Logger };
