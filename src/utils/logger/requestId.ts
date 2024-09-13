import winston from "winston";
import rTracer from "cls-rtracer";

const requestId = winston.format((info) => {
  return { requestId: rTracer.id(), ...info };
});

export default requestId;
