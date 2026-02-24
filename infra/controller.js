import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
} from "infra/errors";

function onNoMatchHandler(req, res) {
  const publicErrorObject = new MethodNotAllowedError();
  res.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(e, req, res) {
  if (e instanceof ValidationError) {
    return res.status(e.statusCode).json(e);
  }

  const publicErrorObject = new InternalServerError({
    statusCode: e.statusCode,
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
