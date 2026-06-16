import { MatFormField, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { Field, FormField } from '@angular/forms/signals';
import { Component, input, output } from '@angular/core';

import { DefaultOptionValueEnum } from '../../../enums/default-option-value.enum';
import { SelectOption } from '../../../interfaces/select-option';

@Component({
  selector: 'gm-select',
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    FormField
  ],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
})
export class SelectComponent {
  readonly defaultOptionValue = DefaultOptionValueEnum.ALL;

  field = input.required<Field<string>>();
  fieldLabel = input<string | null>(null);
  options = input<SelectOption[]>([]);
  valueChange = output<string>();
}
