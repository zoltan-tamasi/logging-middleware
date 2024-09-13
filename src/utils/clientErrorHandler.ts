import { log } from "./logger";
import HttpError, { INTERNAL_SERVER_ERROR } from "./errors/HttpError";

//eslint-disable-next-line no-unused-vars
export default (err, req, res, next) => {
  if (err instanceof HttpError) {
    const eventName = "io.api:error";
    log("error", err.message, {
      eventName,
      logger: "clientErrorHandler",
      path: req.originalUrl,
      method: req.method,
    });
  
    res.status(err.status.code).send({
      error: err.message,
    });  
  } else {
    const stack = err instanceof Error ? err.stack : "";
    const message = err instanceof Error ? err.message : "";
    const eventName = "io.api:error";
    log("error", message, {
      stack,
      eventName,
      logger: "clientErrorHandler",
      path: req.originalUrl,
      method: req.method,
    });
  
    res.status(500).send({
      error: new HttpError(INTERNAL_SERVER_ERROR)
    });
  }
};
