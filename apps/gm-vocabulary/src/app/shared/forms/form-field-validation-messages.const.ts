import { FormFieldValidationMessageKeyEnum } from './form-field-validation-message-key.enum';

export const FormFieldValidationMessagesConst: Record<FormFieldValidationMessageKeyEnum, string> = {
  [FormFieldValidationMessageKeyEnum.REQUIRED]: 'This field is required',
  [FormFieldValidationMessageKeyEnum.EMAIL]: 'Email is not valid',
  [FormFieldValidationMessageKeyEnum.PASSWORDS_MISMATCH]: 'Passwords do not match',
};
