import { SnackBarData } from '../components/snack-bar/snack-bar-data';
import { HttpErrorResponse } from '@angular/common/http';
import { getErrorMessage } from './get-error-message.util';
import { AppError } from '../types/app-error';

export function getErrorSnackBarData(error: AppError | null): SnackBarData | null {
  if (error == null) {
    return null;
  }

  return {
    type: 'error',
    message: error instanceof HttpErrorResponse ? getErrorMessage(error) : error.message,
  };
}
