import { catchError, defer, map, Observable, take, tap, throwError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthParameterEnum } from '@gm-vocabulary/auth/util';
import { AuthApiService } from '../auth-api/auth-api.service';
import { LoginResponse } from '@gm-vocabulary/auth/util';
import { AuthStore } from '../../store/auth/auth.store';
import { SignupRequest, LoginCredentials } from '@gm-vocabulary/auth/util';

@Service()
export class AuthService {
  private readonly authApiService = inject(AuthApiService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  authState = this.authStore.isAuthenticated;
  authLoadingState = this.authStore.isLoading;
  authError = this.authStore.error;

  token = this.authStore.token;
  userId = this.authStore.userId;
  username = this.authStore.username;
  private tokenTimer?: ReturnType<typeof setTimeout>;

  signup(user: SignupRequest): Observable<void> {
    return this.handleAuth(
      defer(() => this.authApiService.signup(user)),
      false,
    );
  }

  login(user: LoginCredentials): Observable<void> {
    return this.handleAuth(this.authenticate(user), true);
  }

  private handleAuth(request: Observable<unknown>, isLoginModeActive: boolean): Observable<void> {
    this.toggleAuthLoadingState(true);
    this.authStore.setError(null);
    return request.pipe(
      take(1),
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => {
        this.toggleAuthLoadingState(false);
        this.authStore.setError(err);
        return throwError(() => err);
      }),
      tap(() => {
        this.toggleAuthLoadingState(false);
        if (isLoginModeActive) {
          this.toggleAuthState(true);
          this.router.navigate(['/']);
        }
      }),
      map(() => void 0),
    );
  }

  private authenticate(user: LoginCredentials): Observable<void> {
    return this.authApiService.login(user).pipe(
      tap((response: LoginResponse) => {
        this.setAuthTimer(response.expiresInSeconds);
        this.saveAuthData(
          response.token,
          new Date(new Date().getTime() + response.expiresInSeconds * 1000),
          response.userId,
          response.username,
        );
      }),
      map(() => void 0),
    );
  }

  logout(): void {
    this.toggleAuthState(false);
    this.clearAuthData();
    this.router.navigate(['/auth']);
    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
    }
  }

  autoAuthUser(): void {
    const authData = this.getAuthData();
    if (!authData) {
      this.clearAuthData();
      return;
    }
    const expiresIn = authData.expiresIn.getTime() - new Date().getTime();
    if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
      this.clearAuthData();
      return;
    }

    this.updateAuthStore(authData.token, authData.userId, authData.username);
    this.toggleAuthState(true);
    this.setAuthTimer(expiresIn / 1000);
  }

  private updateAuthStore(
    token: string | null,
    userId: string | null,
    username: string | null,
  ): void {
    this.authStore.setAuthData(token, userId, username);
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

  private saveAuthData(token: string, expiresIn: Date, userId: string, username: string): void {
    this.updateAuthStore(token, userId, username);
    localStorage.setItem(AuthParameterEnum.TOKEN, token);
    localStorage.setItem(AuthParameterEnum.EXPIRES_IN, expiresIn.toISOString());
    localStorage.setItem(AuthParameterEnum.USER_ID, userId);
    localStorage.setItem(AuthParameterEnum.USERNAME, username);
  }

  private clearAuthData(): void {
    this.authStore.resetStore();
    localStorage.removeItem(AuthParameterEnum.TOKEN);
    localStorage.removeItem(AuthParameterEnum.EXPIRES_IN);
    localStorage.removeItem(AuthParameterEnum.USER_ID);
    localStorage.removeItem(AuthParameterEnum.USERNAME);
  }

  private getAuthData(): {
    token: string;
    expiresIn: Date;
    userId: string;
    username: string | null;
  } | null {
    const token = localStorage.getItem(AuthParameterEnum.TOKEN);
    const expiresIn = localStorage.getItem(AuthParameterEnum.EXPIRES_IN);
    const userId = localStorage.getItem(AuthParameterEnum.USER_ID);
    if (!token || !expiresIn || !userId) {
      return null;
    }

    return {
      token,
      expiresIn: new Date(expiresIn),
      userId,
      username: localStorage.getItem(AuthParameterEnum.USERNAME),
    };
  }
}
