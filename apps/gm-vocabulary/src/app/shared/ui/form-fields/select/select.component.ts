import { MatError, MatFormField, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { Field, FormField } from '@angular/forms/signals';
import { Component, input, output } from '@angular/core';

import { DefaultOptionValueEnum } from '../../../forms/default-option-value.enum';
import { SelectOption } from '../../../forms/select-option';
import { createSignalFormFieldState } from '../../../forms/signal-form-field-state.util';

@Component({
  selector: 'gm-select',
  imports: [MatFormField, MatLabel, MatSelect, MatOption, FormField, MatError],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
})
export class SelectComponent {
  readonly defaultOptionValue = DefaultOptionValueEnum.ALL;

  field = input.required<Field<string>>();
  fieldLabel = input<string | null>(null);
  options = input<SelectOption[]>([]);
  valueChange = output<string>();

  private readonly fieldState = createSignalFormFieldState(this.field);
  readonly errors = this.fieldState.errors;
  readonly showErrors = this.fieldState.showErrors;
}
