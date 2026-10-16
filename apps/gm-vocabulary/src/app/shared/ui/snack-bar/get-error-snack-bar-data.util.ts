import { HttpErrorResponse } from '@angular/common/http';
import { AppError } from './app-error';
import { getErrorMessage } from './get-error-message.util';

import { SnackBarData } from './snack-bar-data';

export function getErrorSnackBarData(error: AppError | null): SnackBarData | null {
  if (error == null) {
    return null;
  }

  return {
    type: 'error',
    message: error instanceof HttpErrorResponse ? getErrorMessage(error) : error.message,
  };
}
