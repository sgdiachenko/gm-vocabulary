import { HttpErrorResponse } from '@angular/common/http';
import { AppError, getErrorMessage } from '@gm-vocabulary/shared/util';

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
