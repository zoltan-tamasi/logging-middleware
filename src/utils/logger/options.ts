import winston from "winston";
import requestId from "./requestId";

/**
 * see Google's documentation on log levels {@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity}
 */
const customLogLevels = {
  levels: {
    emergency: 0, // One or more systems are unusable.
    alert: 1, // A person must take an action immediately.
    critical: 2, // Critical events cause more severe problems or outages.
    error: 3, // Error events are likely to cause problems.
    warning: 4, // Warning events might cause problems.
    notice: 5, // Normal but significant events, such as start up, shut down, or a configuration change.
    info: 6, // Routine information, such as ongoing status or performance.
    debug: 7, // Debug or trace information.
  },
};

const defaultOptions = {
  defaultMeta: {
    recordType: "operational",
  },
  levels: customLogLevels.levels,
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    requestId(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
};

export default defaultOptions;
