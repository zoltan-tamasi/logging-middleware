import * as express from "express";
import { setNamespace, setEventName, setMetaForLogging } from "../utils/loggerMiddlewares";
import HttpError, { CONFLICT, NOT_IMPLEMENTED } from "../utils/errors/HttpError";

const userRouter = express.Router();

userRouter.use(setNamespace("user"));

userRouter
  .use(setEventName("list"))
  .get("/", (req, res) => {
    res.json({
      users: []
    });
  });


userRouter
  .use(setEventName("add"))
  .post("/", (req, res) => {
    setMetaForLogging(res, {
      info: "additional info"
    })
    res.status(204).send("OK");
  });

userRouter
  .delete("/", (req, res) => {
    throw new Error("Something was wrong");
  });

userRouter
  .use(setEventName("modify"))
  .patch("/", (req, res) => {
    throw new HttpError(NOT_IMPLEMENTED);
  });



export { userRouter };
