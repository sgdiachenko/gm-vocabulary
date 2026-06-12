import { catchError, defer, iif, map, Observable, take, tap, throwError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, inject, Service } from '@angular/core';
import { Router } from '@angular/router';

import { AuthParameterEnum } from '../../enums/auth.parameter.enum';
import { AuthApiService } from '../auth-api/auth-api.service';
import { LoginResponse } from '../../interfaces/login-response';
import { AuthStore } from '../../store/auth/auth.store';
import { Auth } from '../../interfaces/auth';

@Service()
export class AuthService {
  private readonly authApiService = inject(AuthApiService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef)

  authState = this.authStore.isAuthenticated;
  authLoadingState = this.authStore.isLoading;
  authError = this.authStore.error;

  token = this.authStore.token;
  userId = this.authStore.userId;
  private tokenTimer: ReturnType<typeof setTimeout>;

  auth(user: Auth, isLoginModeActive: boolean): Observable<void> {
    this.toggleAuthLoadingState(true);
    return iif(
      () => isLoginModeActive,
      defer(() => this.login(user)),
      defer(() => this.authApiService.signup(user))
    ).pipe(
      take(1),
      takeUntilDestroyed(this.destroyRef),
      catchError(err => {
        this.toggleAuthLoadingState(false);
        this.authStore.setError(new Error(err.error?.message ?? err.message));
        return throwError(() => err);
      }),
      tap(() => {
        this.toggleAuthState(true);
        this.toggleAuthLoadingState(false);
        if (isLoginModeActive) {
          this.router.navigate(['/']);
        }
      }),
      map(() => null),
    );
  }

  private login(user: Auth): Observable<void> {
    return this.authApiService.login(user)
      .pipe(
        tap((response: LoginResponse) => {
          this.setAuthTimer(response.expiresInSeconds);
          this.saveAuthData(
            response.token,
            new Date(new Date().getTime() + response.expiresInSeconds * 1000),
            response.userId
          );
        }),
        map(() => void 0)
      );
  }

  logout(): void {
    this.toggleAuthState(false);
    this.clearAuthData();
    this.router.navigate(['/auth']);
    clearTimeout(this.tokenTimer);
  }

  autoAuthUser(): void {
    const authData = this.getAuthData();
    if (!authData) {
      return
    }
    const expiresIn = authData.expiresIn.getTime() - new Date().getTime();
    if (expiresIn > 0) {
      this.updateAuthStore(authData.token, authData.userId);
      this.toggleAuthState(true);
      this.setAuthTimer(expiresIn / 1000);
    }
  }

  private updateAuthStore(token: string | null, userId: string | null): void {
    this.authStore.setAuthData(token, userId);
  }

  private setAuthTimer(durationInSeconds: number): void {
    this.tokenTimer = setTimeout(() => {
      this.logout();
      this.authStore.setError(new Error('Session expired'));
    }, durationInSeconds * 1000);
  }

  private toggleAuthState(state: boolean) {
    this.authStore.setAuthState(state);
  }

  private toggleAuthLoadingState(state: boolean) {
    this.authStore.setLoadingState(state);
  }

  private saveAuthData(
    token: string,
    expiresIn: Date,
    userId: string
  ): void {
    this.updateAuthStore(token, userId);
    localStorage.setItem(AuthParameterEnum.TOKEN, token);
    localStorage.setItem(AuthParameterEnum.EXPIRES_IN, expiresIn.toISOString());
    localStorage.setItem(AuthParameterEnum.USER_ID, userId);
  }

  private clearAuthData(): void {
    this.authStore.resetStore();
    localStorage.removeItem(AuthParameterEnum.TOKEN);
    localStorage.removeItem(AuthParameterEnum.EXPIRES_IN);
    localStorage.removeItem(AuthParameterEnum.USER_ID);
  }

  private getAuthData(): { token: string; expiresIn: Date; userId: string } {
    const token = localStorage.getItem(AuthParameterEnum.TOKEN);
    const expiresIn = localStorage.getItem(AuthParameterEnum.EXPIRES_IN);
    const userId = localStorage.getItem(AuthParameterEnum.USER_ID);
    if (!token || !expiresIn || !userId) {
      return null;
    }

    return {
      token,
      expiresIn: new Date(expiresIn),
      userId
    };
  }
}
