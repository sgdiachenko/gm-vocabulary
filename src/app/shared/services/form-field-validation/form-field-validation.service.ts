import { ValidationErrors } from '@angular/forms';
import { computed, Service, Signal } from '@angular/core';

import { FormFieldValidationMessagesConst } from '../../const/form-field-validation-messages.const';
import { FieldTree } from '@angular/forms/signals';

@Service()
export class FormFieldValidationService {
  getErrorsMessages(errors: ValidationErrors | null): string[] {
    return errors != null ? Object.keys(errors).map((key: string) => FormFieldValidationMessagesConst[key]): [];
  }

  isSignalFormValid<T>(form: FieldTree<T>): Signal<boolean> {
    return computed(() => {
      return Object.values(form).every((item: FieldTree<T>) => item().valid());
    })
  }

  getSignalFormFieldErrorMessages(errors: any[]): string[] {
    return errors.map(error => error.message);
  }
}
