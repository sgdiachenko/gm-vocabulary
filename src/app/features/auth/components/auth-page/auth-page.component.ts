import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, Signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';

import { DataLoadingWrapperComponent } from '../../../../shared/components/data-loading-wrapper/data-loading-wrapper.component';
import { AuthFormComponent } from '../auth-form/auth-form.component';
import { AuthService } from '../../../../services/auth/auth.service';
import { Auth } from '../../../../services/auth-api/auth';

@Component({
  selector: 'gm-auth-page',
  imports: [
    AuthFormComponent,
    DataLoadingWrapperComponent
  ],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthPageComponent {
  private authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef)

  authLoadingState: Signal<boolean> = this.authService.authLoadingState;
  authErrorMessage: Signal<Error> = this.authService.authError;
  isSignupFormActive: WritableSignal<boolean> = signal(false);

  submit(user: Auth) {
    this.authService.auth(user, !this.isSignupFormActive())
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.isSignupFormActive()) {
            this.isSignupFormActive.set(false)
          }
        }
      });
  }
}
