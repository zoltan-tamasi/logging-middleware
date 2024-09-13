# Logging middleware

This is an express middleware for API-s to provide logging and error traceability.

It is built with the following goals in mind:

 * logging of all the user requests in a centralized place
 * at least 1 log entry for all incoming user requests for audit with a status of success and a description of the intent
 * avoiding to leak out error details or stacktraces for the client upon unknown errors
 * easy start: it requires only 1 line to set it up
 * customizability: additional request handler middleware for customization

## Format of audit logs

An example of a log entry provided by logging-middleware:

```json
{
    "eventName":"main.user:add",
    "level":"notice",
    "message":"main.user:add successful",
    "path":"/users",
    "recordType":"audit",
    "responseTime":1,
    "statusCode":204,
    "timestamp":"2024-09-13T08:15:37.763Z"
}
```
* eventName: 

    The value of this field will have the format: NAMESPACE:ACTION
    The namespace is by default: io.logging-middleware, and can be set by adding `setNamepace`:

    ```
    app.use("/", setNamespace("main"), rootRouter);
    ```

    All the requests under this route will have the namespace: "main". Namespaces can be embedded in each other, so for example:

    ```
    app.use("/", setNamespace("main"), rootRouter);
    app.use("/users", userRouter);
    userRouter.use(setNamespace("user"));
    ```

    All the requests under `/users` route will have the namespace: "main.user".

* message:

  This field will have the value of the eventName and a string of `successful` of `unsuccessful`

## Format of error logs for known errors

To handle known errors `HttpError` can be used. For example:

```javascript
throw new HttpError(NOT_IMPLEMENTED);
```

Where `NOT_IMPLEMENTED` also comes from `HttpError` module, and similar error types can be manually added.
If this kind of error is thrown, the client will only get a short description about the failure of their request:

```json
{"error":"Not implemented"}
```

The audit log entry would be something like:

```json
{
    "eventName":"main.user:modify",
    "level":"warning",
    "message":"main.user:modify unsuccessful",
    "path":"/users",
    "recordType":"audit",
    "responseTime":1,
    "statusCode":400,
    "timestamp":"2024-09-13T08:55:53.884Z"
}
```

An additional operational error would also be written:

```json
{
    "eventName":"io.api:error",
    "level":"error",
    "logger":"clientErrorHandler",
    "message":"Not implemented",
    "method":"PATCH",
    "path":"/users",
    "recordType":"operational",
    "timestamp":"2024-09-13T08:55:53.882Z"
}
```

## Format of error logs for unknown errors

In the case of unknown errors, the clients will only see:

```json
{"error":{"status":{"code":500,"message":"Internal Server Error"},"name":"HttpError"}}
```

Not revealing anything about the error, and the audit log entry won't be polluted with error details either:

```json
{
    "eventName":"main.user:add",
    "level":"error",
    "message":"main.user:add unsuccessful",
    "path":"/users",
    "recordType":"audit",
    "responseTime":4,
    "statusCode":500,
    "timestamp":"2024-09-13T09:16:58.534Z"}
```

For tracing the error, details will be in the operational log entry:

```json
{
    "eventName":"io.api:error",
    "level":"error",
    "logger":"clientErrorHandler",
    "message":"Something was wrong",
    "method":"DELETE",
    "path":"/users",
    "recordType":"operational",
    "stack":"Error: Something was wrong\n    at ...",
    "timestamp":"2024-09-13T09:16:58.531Z"}
```


## Setup

You only have to import it, and add it a request handler to your Express server:

```javascript
app.use(loggerMiddleware);
```

To add the error handler, you should add it at the end of the request handler chain:

```javascript
app.use(clientErrorHandler);
```

This will catch errors in a centralized way, and send out correct responses and write log entries, both audit and operational.


## List of handlers can be used
* setMetaForLogging
    This handler can be used to add additional metadata to the log entries. Usage:
    Inside the request handler controller part:
    ```javascript
    setMetaForLogging(res, {
      info: "additional info"
    })
    ```
    After this, the audit will have an additional field accordingly:
    ```json
    {
        ...
        "info": "additional info"
        ...
    }
    ```


* setEventName

    By default event name is determined by the HTTP method as the following:

    * GET: "get"
    * POST: "create"
    * PUT: "update"
    * PATCH: "update"
    * DELETE: "delete"

    This can be overwritten by adding `setEventName` to a request handler:

    ```javascript
    userRouter
        .use(setEventName("add"))
        .post("/", (req, res) => { ...
    ```

* setNamespace

    The namespace is by default: io.logging-middleware, and can be set by adding `setNamepace`:

    ```
    app.use("/", setNamespace("main"), rootRouter);
    ```

    All the requests under this route will have the namespace: "main". Namespaces can be embedded in each other, so for example:

    ```
    app.use("/", setNamespace("main"), rootRouter);
    app.use("/users", userRouter);
    userRouter.use(setNamespace("user"));
    ```

    All the requests under `/users` route will have the namespace: "main.user".


* disableLogging

    By adding this, the logging for a route can be totally disabled.


  

