import { Request } from "express";

import { LogLevel } from "./auditLogger";

export const getSeverity = (statusCode: number): LogLevel => {
  if (statusCode >= 500) {
    return "error";
  } else if (statusCode < 500 && statusCode >= 400) {
    return "warning";
  }

  return "notice";
};

export function getEventName(req: Request): string {
  return req.body.eventName;
}

export function getLevel(req: Request): LogLevel {
  return req.body.severity;
}

export function getMessage(req: Request): string {
  return req.body.message;
}

export function getData(req: Request): { [key: string]: any } {
  const data = req.body.data;
  let result;

  if (typeof data === "object" && !(data instanceof Array)) {
    if (data instanceof Error) {
      result = { error: data };
    } else {
      result = data;
    }
  } else {
    result = { data };
  }

  return result;
}
