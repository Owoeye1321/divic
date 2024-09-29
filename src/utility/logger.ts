import * as winston from 'winston';
/**
 * the function blow is used to enumbrate error format
 */
const enumerateErrorFormat = winston.format((info: any) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

/**
 * the main logger funcion
 * this is the configuration of the eroor logger
 */
export const logger = winston.createLogger({
  level: process.env.IS_PRODUCTION ? 'info' : 'debug',
  format: winston.format.combine(
    enumerateErrorFormat(),
    winston.format.colorize(),
    winston.format.splat(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`),
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});
