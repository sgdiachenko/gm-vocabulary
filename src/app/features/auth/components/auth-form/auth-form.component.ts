import { Component, inject, input, OnChanges, output, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
export class AuthFormComponent implements OnChanges {
  isSignupFormActive = input(false);
  submitForm = output<Auth>();
  toggleView = output<boolean>();

  private formFieldValidationService = inject(FormFieldValidationService);

  readonly emailControlName = 'email';
  readonly passwordControlName = 'password';
  readonly repeatPasswordControlName = 'repeatPassword';

  formGroup: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder) {
    this.formGroup = this.fb.group({
      [this.emailControlName]: ['', [Validators.required, Validators.email]],
      [this.passwordControlName]: ['', [Validators.required]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const isSignupFormActive = changes['isSignupFormActive']?.currentValue;
    if (isSignupFormActive != null && !changes['isSignupFormActive'].isFirstChange()) {
      this.toggleRepeatPasswordField(isSignupFormActive);
    }
  }

  getControlErrorsMessages(controlName: string): string[] {
    return this.formGroup.get(controlName)?.dirty
      ? this.formFieldValidationService.getErrorsMessages(this.formGroup.get(controlName)?.errors)
      : null;
  }

  submitBtnClicked(): void {
    this.submitForm.emit({
      email: this.formGroup.value.email,
      password: this.formGroup.value.password
    });
  }

  private toggleRepeatPasswordField(showRepeatPassword: boolean) {
    if (showRepeatPassword) {
      this.formGroup.addControl(this.repeatPasswordControlName, this.fb.control('', [Validators.required]));
    } else {
      this.formGroup.removeControl(this.repeatPasswordControlName);
    }
  }
}
