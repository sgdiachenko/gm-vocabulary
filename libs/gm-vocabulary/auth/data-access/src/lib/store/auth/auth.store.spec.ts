import { TestBed } from '@angular/core/testing';

import { AuthStore, initialState } from './auth.store';

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(AuthStore);
    store.resetStore();
  });

  it('should expose initial auth state', () => {
    expect(store.isAuthenticated()).toBe(initialState.isAuthenticated);
    expect(store.isLoading()).toBe(initialState.isLoading);
    expect(store.error()).toBe(initialState.error);
    expect(store.token()).toBe(initialState.token);
    expect(store.userId()).toBe(initialState.userId);
  });

  it('should update auth flags and auth data', () => {
    const error = new Error('Auth failed');

    store.setAuthState(true);
    store.setLoadingState(false);
    store.setError(error);
    store.setAuthData('token-1', 'user-1');

    expect(store.isAuthenticated()).toBe(true);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe(error);
    expect(store.token()).toBe('token-1');
    expect(store.userId()).toBe('user-1');
  });

  it('should reset store state', () => {
    store.setAuthState(true);
    store.setLoadingState(true);
    store.setError(new Error('Auth failed'));
    store.setAuthData('token-1', 'user-1');

    store.resetStore();

    expect(store.isAuthenticated()).toBe(initialState.isAuthenticated);
    expect(store.isLoading()).toBe(initialState.isLoading);
    expect(store.error()).toBe(initialState.error);
    expect(store.token()).toBe(initialState.token);
    expect(store.userId()).toBe(initialState.userId);
  });
});
