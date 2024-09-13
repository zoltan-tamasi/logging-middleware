require("dotenv").config();
import express from "express";
import http from "http";
import rootRouter from "./routes";
import clientErrorHandler from "./utils/clientErrorHandler";
import { log } from "./utils/logger";
import { loggerMiddleware, disableLogging, setNamespace } from "./utils/loggerMiddlewares";

const app = express();
const httpServer = http.createServer(app);
const port = process.env.PORT || 3000;

app.use(loggerMiddleware);

app.use("/", setNamespace("main"), rootRouter);

app.use(clientErrorHandler);

httpServer.listen(port, function () {
  log("notice", `Started on port ${port}.`, { eventName: "io.logging-middleware:start" });
});

process.on("unhandledRejection", (reason) => {
  log("alert", "UnhandledRejection", { error: reason instanceof Error ? reason.stack : reason });
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  log("alert", "UncaughtException", { error: error.stack });
  process.exit(1);
});
