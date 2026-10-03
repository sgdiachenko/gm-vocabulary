import { Types } from 'mongoose';

export class HttpError extends Error {
  constructor(statusCode, message) {
    super(Array.isArray(message) ? message.join(', ') : message);
    this.statusCode = statusCode;
    this.details = message;
  }
}

export function objectId(value) {
  if (!Types.ObjectId.isValid(value)) {
    throw new HttpError(400, `Invalid ObjectId: ${value}`);
  }
  return new Types.ObjectId(value);
}

export function errorHandler(error, _request, response, _next) {
  if (error instanceof HttpError) {
    return response.status(error.statusCode).json({ message: error.details });
  }
  if (error?.status === 400 && error?.type === 'entity.parse.failed') {
    return response.status(400).json({ message: 'Malformed JSON' });
  }
  if (error?.code === 11000) {
    return response.status(409).json({ message: 'Email already in use' });
  }
  console.error(error);
  return response.status(500).json({ message: 'Internal server error' });
}
