import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export interface AuthState {
  isAuthenticated: boolean | null;
  isLoading: boolean | null;
  error: Error | null;
  token: string | null;
  userId: string | null;
}

export const initialState: AuthState = {
  isAuthenticated: null,
  isLoading: null,
  error: null,
  token: null,
  userId: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(store => ({
    setAuthState(isAuthenticated: boolean) {
      patchState(store, { isAuthenticated });
    },
    setLoadingState(isLoading: boolean) {
      patchState(store, { isLoading });
    },
    setError(error: Error | null) {
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
