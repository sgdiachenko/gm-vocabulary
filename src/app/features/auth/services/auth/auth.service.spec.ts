import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';

import { AuthParameterEnum } from '../../enums/auth.parameter.enum';
import { AuthApiService } from '../auth-api/auth-api.service';
import { AuthStore } from '../../store/auth/auth.store';
import { AuthService } from './auth.service';
import { Auth } from '../../interfaces/auth';

describe('AuthService', () => {
  let service: AuthService;
  let authStore: InstanceType<typeof AuthStore>;
  let mockAuthApiService: {
    login: ReturnType<typeof vi.fn>;
    signup: ReturnType<typeof vi.fn>;
  };
  let mockRouter: {
    navigate: ReturnType<typeof vi.fn>;
  };

  const user: Auth = {
    email: 'test@example.com',
    password: 'password',
  };

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();

    mockAuthApiService = {
      login: vi.fn(),
      signup: vi.fn(),
    };
    mockRouter = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AuthApiService, useValue: mockAuthApiService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    service = TestBed.inject(AuthService);
    authStore = TestBed.inject(AuthStore);
    authStore.resetStore();
  });

  afterEach(() => {
    service.logout();
    localStorage.clear();
    vi.useRealTimers();
  });

  it('should login, update store, persist auth data, and navigate home', async () => {
    mockAuthApiService.login.mockReturnValue(of({
      token: 'token-1',
      expiresInSeconds: 60,
      userId: 'user-1',
    }));

    await firstValueFrom(service.auth(user, true));

    expect(mockAuthApiService.login).toHaveBeenCalledWith(user);
    expect(service.authState()).toBe(true);
    expect(service.authLoadingState()).toBe(false);
    expect(service.authError()).toBeNull();
    expect(service.token()).toBe('token-1');
    expect(service.userId()).toBe('user-1');
    expect(localStorage.getItem(AuthParameterEnum.TOKEN)).toBe('token-1');
    expect(localStorage.getItem(AuthParameterEnum.USER_ID)).toBe('user-1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should signup without navigating home', async () => {
    mockAuthApiService.signup.mockReturnValue(of(user));

    await firstValueFrom(service.auth(user, false));

    expect(mockAuthApiService.signup).toHaveBeenCalledWith(user);
    expect(service.authState()).toBe(true);
    expect(service.authLoadingState()).toBe(false);
    expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/']);
  });

  it('should expose auth errors and stop loading on failure', async () => {
    const error = { error: { message: 'Invalid credentials' } };
    mockAuthApiService.login.mockReturnValue(throwError(() => error));

    await expect(firstValueFrom(service.auth(user, true))).rejects.toBe(error);

    expect(service.authLoadingState()).toBe(false);
    expect(service.authError()?.message).toBe('Invalid credentials');
    expect(service.authState()).toBeNull();
  });

  it('should auto-auth user from valid local storage data', () => {
    localStorage.setItem(AuthParameterEnum.TOKEN, 'stored-token');
    localStorage.setItem(AuthParameterEnum.USER_ID, 'stored-user');
    localStorage.setItem(
      AuthParameterEnum.EXPIRES_IN,
      new Date(Date.now() + 60_000).toISOString(),
    );

    service.autoAuthUser();

    expect(service.token()).toBe('stored-token');
    expect(service.userId()).toBe('stored-user');
    expect(service.authState()).toBe(true);
  });

  it('should logout, clear store, clear local storage, and navigate to auth page', () => {
    authStore.setAuthState(true);
    authStore.setAuthData('token-1', 'user-1');
    localStorage.setItem(AuthParameterEnum.TOKEN, 'token-1');
    localStorage.setItem(AuthParameterEnum.USER_ID, 'user-1');

    service.logout();

    expect(service.authState()).toBeNull();
    expect(service.token()).toBeNull();
    expect(service.userId()).toBeNull();
    expect(localStorage.getItem(AuthParameterEnum.TOKEN)).toBeNull();
    expect(localStorage.getItem(AuthParameterEnum.USER_ID)).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth']);
  });
});
