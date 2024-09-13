import winston from "winston";
import defaultOptions from "./options";

export type LogLevel = "emergency" | "alert" | "critical" | "error" | "warning" | "notice" | "info" | "debug";

export type AuditLogEntry = {
  userIdentity: string;
  eventName: string;
};

const auditOptions = { 
  ...defaultOptions,
  defaultMeta: { recordType: "audit" },
  level: process.env.AUDITLOG_LEVEL || "info",
};

const auditLogger = winston.createLogger(auditOptions);

const auditLog = (level: LogLevel, message: string, meta: AuditLogEntry) => {
  auditLogger.log(level, message, meta);
};

export { auditLogger, auditLog };
