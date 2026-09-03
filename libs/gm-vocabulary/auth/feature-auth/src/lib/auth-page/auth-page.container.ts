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

import { DataLoadingWrapperComponent } from '@gm-vocabulary/shared/ui';
import { SnackBarData } from '@gm-vocabulary/shared/ui';
import { getErrorSnackBarData } from '@gm-vocabulary/shared/ui';
import { AuthFormComponent } from '@gm-vocabulary/auth/ui';
import { AuthService } from '@gm-vocabulary/auth/data-access';
import { Auth } from '@gm-vocabulary/auth/util';

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

  submit(user: Auth) {
    this.authService
      .auth(user, !this.isSignupFormActive())
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.isSignupFormActive()) {
            this.isSignupFormActive.set(false);
          }
        },
      });
  }
}
