import winston from "winston";

/**
 * Extracts Express-Winston's `meta` fields to root
 */
const metaToInfo = winston.format((info) => {
  const { meta, ...rest } = info;
  const { userIdentity, httpRequest, res, req, responseTime, stack } = meta;

  if (httpRequest) {
    httpRequest.statusCode = res?.statusCode;
    httpRequest.responseTime = responseTime;
  }

  return {
    userIdentity,
    httpRequest,
    ...rest,
    headers: req?.headers,
    stack,
  };
});

export default metaToInfo;
