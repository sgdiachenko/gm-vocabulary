import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Component, effect, inject, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';

import {
  FormFieldValidationService
} from '../../../../shared/services/form-field-validation/form-field-validation.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { Auth } from '../../interfaces/auth';


@Component({
  selector: 'gm-auth-form',
  imports: [
    InputComponent,
    ReactiveFormsModule,
    ButtonComponent,
    MatButton,
  ],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss',
})
export class AuthFormComponent {
  isSignupFormActive = input(false);
  submitForm = output<Auth>();
  toggleView = output<boolean>();

  private formFieldValidationService = inject(FormFieldValidationService);
  private fb = inject(FormBuilder);

  readonly emailControlName = 'email';
  readonly passwordControlName = 'password';
  readonly repeatPasswordControlName = 'repeatPassword';

  formGroup: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
    repeatPassword?: FormControl<string>;
  }>;

  constructor() {
    this.formGroup = this.fb.nonNullable.group({
      [this.emailControlName]: ['', [Validators.required, Validators.email]],
      [this.passwordControlName]: ['', [Validators.required]],
    }, {
      validators: this.passwordsMatch(this.passwordControlName, this.repeatPasswordControlName),
    });

    effect(() => {
      this.toggleRepeatPasswordField(this.isSignupFormActive());
    });
  }

  getControlErrorsMessages(controlName: string): string[] | null {
    const control = this.formGroup.get(controlName);

    if (!control?.dirty) {
      return null;
    }

    const shouldShowPasswordsMismatch =
      this.formGroup.hasError('passwordsMismatch') &&
      (controlName === this.repeatPasswordControlName ||
        controlName === this.passwordControlName &&
        this.formGroup.get(this.repeatPasswordControlName)?.dirty);

    if (shouldShowPasswordsMismatch) {
      return this.formFieldValidationService.getErrorsMessages({ passwordsMismatch: true });
    }

    return this.formFieldValidationService.getErrorsMessages(control.errors);
  }

  submitBtnClicked(): void {
    const { email, password } = this.formGroup.getRawValue();

    this.submitForm.emit({ email, password });
  }

  private toggleRepeatPasswordField(showRepeatPassword: boolean): void {
    const hasRepeatPasswordControl = this.formGroup.contains(this.repeatPasswordControlName);

    if (showRepeatPassword && !hasRepeatPasswordControl) {
      this.formGroup.addControl(
        this.repeatPasswordControlName,
        this.fb.nonNullable.control('', [Validators.required]),
      );
    }

    if (!showRepeatPassword && hasRepeatPasswordControl) {
      this.formGroup.removeControl(this.repeatPasswordControlName);
    }
  }

  private passwordsMatch(passwordControlName: string, confirmPasswordControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get(passwordControlName)?.value;
      const confirmPassword = formGroup.get(confirmPasswordControlName)?.value;

      if (!confirmPassword) {
        return null;
      }

      return password === confirmPassword ? null : { passwordsMismatch: true };
    };
  }
}
