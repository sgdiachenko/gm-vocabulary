import { HttpErrorResponse } from '@angular/common/http';

import { ErrorMessage } from '../types/error-message';

const UNKNOWN_ERROR_MESSAGE = 'An unknown error occurred';

export function getErrorMessage(error: HttpErrorResponse): ErrorMessage {
  const message: unknown = error.error?.message;

  if (Array.isArray(message)) {
    const validMessages = message.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0,
    );

    return validMessages.length > 0 ? validMessages : UNKNOWN_ERROR_MESSAGE;
  }

  if (typeof message === 'string' && message.trim().length > 0) {
    return message;
  }

  return error.message || UNKNOWN_ERROR_MESSAGE;
}
