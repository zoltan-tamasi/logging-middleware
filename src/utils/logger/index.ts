import winston from "winston";
import { LogLevel } from "./auditLogger";
import defaultOptions from "./options";

const logger = winston.createLogger(defaultOptions);

const log = (level: LogLevel, error: Error | string, meta: any) => {
  if (error instanceof Error) {
    logger.log("error", `${error.message}`, meta);
  } else {
    logger.log(level, error, meta);
  }
};

export { logger, log };
