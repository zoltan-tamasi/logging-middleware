
type HttpErrorStatus = {
  code: number,
  message: string
};

export const BAD_REQUEST: HttpErrorStatus = {
  code: 400,
  message: "Bad request"
};

export const UNAUTHORIZED: HttpErrorStatus = {
  code: 401,
  message: "Unauthorized"
};

export const NOT_FOUND: HttpErrorStatus = {
  code: 404,
  message: "Not Found"
};

export const FORBIDDEN: HttpErrorStatus = {
  code: 403,
  message: "Not Found"
};

export const CONFLICT: HttpErrorStatus = {
  code: 400,
  message: "Conflict"
};

export const NOT_IMPLEMENTED: HttpErrorStatus = {
  code: 400,
  message: "Not implemented"
};


export const INTERNAL_SERVER_ERROR: HttpErrorStatus = {
  code: 500,
  message: "Internal Server Error"
};

class HttpError extends Error {

  constructor(readonly status: HttpErrorStatus, message ?: string, readonly extraJsonFields?: object) {
    super(status.message || message);
    this.name = "HttpError";
  }

  get json() {
    return { error: this.message, ...this.extraJsonFields };
  }

  get extraFields() {
    let result = undefined;
    if (this.extraJsonFields) {
      result = { ...this.extraJsonFields };
      delete result.cause;
    }
    return result;
  }
}

export default HttpError;
