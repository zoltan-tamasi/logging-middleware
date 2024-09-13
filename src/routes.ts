import express from "express";
import { healthCheckRouter } from "./health-check/healthCheckRouter";
import { userRouter } from "./user/userRouter";
import { setNamespace } from "./utils/loggerMiddlewares";

const rootRouter = express.Router();

rootRouter.use("/health", healthCheckRouter);

rootRouter.use("/users", setNamespace("x"), userRouter);

export default rootRouter;
