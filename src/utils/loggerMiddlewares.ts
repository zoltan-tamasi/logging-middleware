/// <reference types="express" />
import { NextFunction, Request, RequestHandler, Response } from "express";
import HttpError from "./errors/HttpError";
import { auditLog, LogLevel } from "./logger/auditLogger";
import { getSeverity } from "./logger/loggerUtils";
import { User } from "./user";

export type LoggingOptions = {
  failureSeverity?: LogLevel;
  namespaces?: string[];
  eventName?: string;
  disabled?: boolean;
};

const mapMethodToEventName = {
  GET: "get",
  POST: "create",
  PUT: "update",
  PATCH: "update",
  DELETE: "delete",
};

const handler =
  <T extends User | void>(userHandler: ({ req, res }) => T) =>
  (
    prepareRequest: ({ req, res, user }: { req: Request; res: Response; user: T }) => {
      run: () => Promise<any>;
      extraAuditFields?: any;
      successResponseCreationDisabled?: boolean;
    }
  ) =>
  (req, res, next) => {
    let extraAuditFields, successResponseCreationDisabled;

    return Promise.resolve()
      .then(() => userHandler({ req, res }))
      .then((user) => prepareRequest({ req, res, user }))
      .then((preparedRequest) => {
        extraAuditFields = preparedRequest.extraAuditFields;
        successResponseCreationDisabled = preparedRequest.successResponseCreationDisabled;
        return preparedRequest.run();
      })
      .then((response) => {
        setMetaForLogging(res, extraAuditFields);
        if (successResponseCreationDisabled) {
          res.end();
        } else if (response === undefined) {
          res.statusCode = 204;
          res.send();
        } else {
          res.statusCode = 200;
          res.json(response);
        }
      })
      .catch((error) => {
        setMetaForLogging(res, extraAuditFields);

        if (error instanceof HttpError) {
          setMetaForLogging(res, { error: error.message });
          res.statusCode = error.status.code;
          res.json(error.json);
        } else {
          const errorMessage = error instanceof Error ? error.message : error;
          setMetaForLogging(res, { error: errorMessage });
          next(error);
        }
      });
  };

const setEventName = (eventName) => setOptionsForLogging({ eventName });

const setNamespace = (namespace) => setOptionsForLogging({ namespace });

const setOptionsForLogging =
  ({
    namespace,
    ...rest
  }: LoggingOptions & { namespace?: string }): RequestHandler<any, any, any, any, { logging: LoggingOptions }> =>
  (req, res, next) => {
    res.locals.logging = res.locals.logging || { namespaces: [] };
    if (namespace) {
      res.locals.logging.namespaces.push(namespace);
    }
    res.locals.logging = Object.assign(res.locals.logging, rest);
    next();
  };

const setMetaForLogging = (res: Response, meta: { [key: string]: any }) => {
  res.locals.meta = Object.assign(res.locals.meta || {}, meta);
};

const disableLogging: RequestHandler<any, any, any, any, { logging: LoggingOptions }> = (req, res, next) => {
  res.locals.logging = res.locals.logging || { namespaces: [] };
  res.locals.logging.disabled = true;
  next();
};

const loggerMiddleware = (
  req: Request,
  res: Response<any, { logging: LoggingOptions; meta: any }>,
  next: NextFunction
) => {
  const path = req.originalUrl || req.url;
  const startTime = new Date();
  const end = res.end;

  //@ts-ignore
  res.end = (chunk, encoding: BufferEncoding) => {
    const responseTime = new Date().getTime() - startTime.getTime();
    const meta = res?.locals?.meta;
    const error = meta?.error;
    const statusCode = res.statusCode;

    const eventName = getEventName(req, res);
    const severity = getSeverity(statusCode);

    if (!res?.locals?.logging?.disabled) {
      auditLog(severity, `${eventName} ${statusCode >= 400 ? "unsuccessful" : "successful"}`, {
        statusCode,
        responseTime,
        eventName,
        path,
        error,
        ...meta,
      });
    }

    res.end = end;
    res.end(chunk, encoding);
  };

  next();
};

function getEventName(req: Request, res: Response) {
  const loggingOptions = { ...res?.locals?.logging };

  if (!loggingOptions.namespaces) {
    loggingOptions.namespaces = [];
    if (req?.route?.path?.split) {
      loggingOptions.namespaces.concat(getNameSpacesFromPath(req));
    } else {
      loggingOptions.namespaces.concat(getNameSpacesFromUrl(req));
    }
  }

  return buildEventName(loggingOptions.namespaces, loggingOptions?.eventName, req.method);
}

function getNameSpacesFromPath(req: Request) {
  return req.route.path.split("/").filter((pathItem) => pathItem.length > 0 && !pathItem.startsWith(":"));
}

function getNameSpacesFromUrl(req: Request) {
  return ["io.logging-middleware", req.originalUrl.split("/").filter((tag) => !!tag)];
}

function buildEventName(namespaces: Array<string>, eventName?: string, httpMethod?: string) {
  return `${namespaces.join(".")}:${eventName || mapMethodToEventName[httpMethod]}`;
}
export {
  setOptionsForLogging,
  setMetaForLogging,
  setEventName,
  setNamespace,
  disableLogging,
  loggerMiddleware,
  handler,
  getEventName,
};
