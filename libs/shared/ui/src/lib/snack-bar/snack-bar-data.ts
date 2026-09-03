import { ErrorMessage } from '@gm-vocabulary/shared/util';

export type SnackBarType = 'success' | 'error' | 'warning' | 'info';

export interface SnackBarData {
  type: SnackBarType;
  message: ErrorMessage;
}
