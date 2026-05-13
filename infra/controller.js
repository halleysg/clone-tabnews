import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "infra/errors";

function onNoMatchHandler(req, res) {
  const publicErrorObject = new MethodNotAllowedError();
  res.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(e, req, res) {
  if (
    e instanceof ValidationError ||
    e instanceof NotFoundError ||
    e instanceof UnauthorizedError
  ) {
    return res.status(e.statusCode).json(e);
  }

  const publicErrorObject = new InternalServerError({
    cause: e,
  });

  console.error(publicErrorObject);

  res.status(publicErrorObject.statusCode).json(publicErrorObject);
}

const controller = {
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
};

export default controller;
