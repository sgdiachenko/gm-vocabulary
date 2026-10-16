import { Component, computed, input, output, Signal, signal, WritableSignal } from '@angular/core';
import { FieldTree, form, FormRoot, required, submit, validate } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';

import { FormFieldValidationMessageKeyEnum } from '../../../shared/forms/form-field-validation-message-key.enum';
import { FormFieldValidationMessagesConst } from '../../../shared/forms/form-field-validation-messages.const';
import { InputComponent } from '../../../shared/ui/form-fields/input/input.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { isStrictEmail } from '../../../shared/forms/strict-email-validator.util';
import { AuthForm } from '../contracts/auth-form';
import { SignupRequest } from '../contracts/signup-request';
import { LoginCredentials } from '../contracts/login-credentials';

@Component({
  selector: 'gm-auth-form',
  imports: [InputComponent, ButtonComponent, MatButton, FormRoot],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss',
})
export class AuthFormComponent {
  isSignupFormActive = input(false);
  submitForm = output<LoginCredentials | SignupRequest>();
  toggleView = output<boolean>();

  readonly emailControlName = 'email';
  readonly passwordControlName = 'password';
  readonly repeatPasswordControlName = 'repeatPassword';

  private readonly authModel: WritableSignal<AuthForm> = signal<AuthForm>({
    username: '',
    email: '',
    password: '',
    repeatPassword: '',
  });

  readonly authForm: FieldTree<AuthForm> = form(
    this.authModel,
    (schemaPath) => {
      required(schemaPath.username, {
        message: FormFieldValidationMessagesConst[FormFieldValidationMessageKeyEnum.REQUIRED],
        when: () => this.isSignupFormActive(),
      });
      validate(schemaPath.username, ({ value }) => {
        if (!this.isSignupFormActive() || value().trim()) return undefined;
        return {
          kind: FormFieldValidationMessageKeyEnum.REQUIRED,
          message: FormFieldValidationMessagesConst[FormFieldValidationMessageKeyEnum.REQUIRED],
        };
      });
      required(schemaPath.email, {
        message: FormFieldValidationMessagesConst[FormFieldValidationMessageKeyEnum.REQUIRED],
      });
      validate(schemaPath.email, ({ value }) => {
        const emailValue = value();

        if (!emailValue || isStrictEmail(emailValue)) {
          return undefined;
        }

        return {
          kind: FormFieldValidationMessageKeyEnum.EMAIL,
          message: FormFieldValidationMessagesConst[FormFieldValidationMessageKeyEnum.EMAIL],
        };
      });
      required(schemaPath.password, {
        message: FormFieldValidationMessagesConst[FormFieldValidationMessageKeyEnum.REQUIRED],
      });
      required(schemaPath.repeatPassword, {
        message: FormFieldValidationMessagesConst[FormFieldValidationMessageKeyEnum.REQUIRED],
        when: () => this.isSignupFormActive(),
      });
      validate(schemaPath.repeatPassword, ({ value, valueOf }) => {
        const repeatPassword = value();

        if (!this.isSignupFormActive() || repeatPassword === '') {
          return undefined;
        }

        return valueOf(schemaPath.password) === repeatPassword
          ? undefined
          : {
              kind: FormFieldValidationMessageKeyEnum.PASSWORDS_MISMATCH,
              message:
                FormFieldValidationMessagesConst[
                  FormFieldValidationMessageKeyEnum.PASSWORDS_MISMATCH
                ],
            };
      });
    },
    {
      submission: {
        action: async () => {
          const { email, password, username } = this.authModel();

          this.submitForm.emit(
            this.isSignupFormActive()
              ? { email, password, username: username.trim() }
              : { email, password },
          );

          return undefined;
        },
      },
    },
  );

  readonly isAuthFormValid: Signal<boolean> = computed(() => this.authForm().valid());
  readonly isAuthFormSubmittable: Signal<boolean> = computed(
    () =>
      this.authForm().dirty() &&
      !this.authForm().invalid() &&
      !this.authForm().pending() &&
      !this.authForm().submitting(),
  );

  submitBtnClicked(): Promise<boolean> {
    return submit(this.authForm);
  }
}
