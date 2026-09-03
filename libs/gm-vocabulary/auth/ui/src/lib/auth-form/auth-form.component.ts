import { Component, computed, input, output, Signal, signal, WritableSignal } from '@angular/core';
import { FieldTree, form, FormRoot, required, submit, validate } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';

import { FormFieldValidationMessageKeyEnum } from '@gm-vocabulary/shared/util';
import { FormFieldValidationMessagesConst } from '@gm-vocabulary/shared/util';
import { InputComponent } from '@gm-vocabulary/shared/ui';
import { ButtonComponent } from '@gm-vocabulary/shared/ui';
import { isStrictEmail } from '@gm-vocabulary/shared/util';
import { AuthForm } from '@gm-vocabulary/auth/util';
import { Auth } from '@gm-vocabulary/auth/util';

@Component({
  selector: 'gm-auth-form',
  imports: [InputComponent, ButtonComponent, MatButton, FormRoot],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss',
})
export class AuthFormComponent {
  isSignupFormActive = input(false);
  submitForm = output<Auth>();
  toggleView = output<boolean>();

  readonly emailControlName = 'email';
  readonly passwordControlName = 'password';
  readonly repeatPasswordControlName = 'repeatPassword';

  private readonly authModel: WritableSignal<AuthForm> = signal<AuthForm>({
    email: '',
    password: '',
    repeatPassword: '',
  });

  readonly authForm: FieldTree<AuthForm> = form(
    this.authModel,
    (schemaPath) => {
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
          const { email, password } = this.authModel();

          this.submitForm.emit({ email, password });

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
