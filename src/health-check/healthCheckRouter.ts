  import * as express from "express";
  import { setNamespace, setEventName } from "../utils/loggerMiddlewares";
  
  const healthCheckRouter = express.Router();
  
  healthCheckRouter.use(setNamespace("healthcheck"));
  
  healthCheckRouter
    .use(setEventName("check"))
    .get("/", (req, res) => {
      res.send("OK");
    });
  
  
  export { healthCheckRouter };
  