import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import { AppError } from '@gm-vocabulary/shared/util';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AppError | null;
  token: string | null;
  userId: string | null;
}

export const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
  userId: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setAuthState(isAuthenticated: boolean) {
      patchState(store, { isAuthenticated });
    },
    setLoadingState(isLoading: boolean) {
      patchState(store, { isLoading });
    },
    setError(error: AppError | null) {
      patchState(store, { error });
    },
    setAuthData(token: string | null, userId: string | null) {
      patchState(store, { token, userId });
    },
    resetStore() {
      patchState(store, initialState);
    },
  })),
);
