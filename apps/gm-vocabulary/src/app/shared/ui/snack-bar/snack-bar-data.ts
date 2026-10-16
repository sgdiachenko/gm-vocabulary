import { ErrorMessage } from './error-message';

export type SnackBarType = 'success' | 'error' | 'warning' | 'info';

export interface SnackBarData {
  type: SnackBarType;
  message: ErrorMessage;
}
