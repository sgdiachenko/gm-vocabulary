import {
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';

import { DataLoadingWrapperComponent } from '../../../shared/ui/data-loading-wrapper/data-loading-wrapper.component';
import { SnackBarData } from '../../../shared/ui/snack-bar/snack-bar-data';
import { getErrorSnackBarData } from '../../../shared/ui/snack-bar/get-error-snack-bar-data.util';
import { AuthFormComponent } from '../auth-form/auth-form.component';
import { AuthService } from '../auth.service';
import { SignupRequest } from '../contracts/signup-request';
import { LoginCredentials } from '../contracts/login-credentials';

@Component({
  selector: 'gm-auth-page',
  imports: [AuthFormComponent, DataLoadingWrapperComponent],
  templateUrl: './auth-page.container.html',
  styleUrl: './auth-page.container.scss',
})
export class AuthPageContainer {
  private authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  authLoadingState: Signal<boolean> = this.authService.authLoadingState;
  snackBarData: Signal<SnackBarData | null> = computed(() => {
    return getErrorSnackBarData(this.authService.authError());
  });
  isSignupFormActive: WritableSignal<boolean> = signal(false);

  submit(user: LoginCredentials | SignupRequest) {
    const request =
      'username' in user ? this.authService.signup(user) : this.authService.login(user);
    request.pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        if (this.isSignupFormActive()) {
          this.isSignupFormActive.set(false);
        }
      },
    });
  }
}
