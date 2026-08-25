import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { Field, FormField } from '@angular/forms/signals';
import { Component, input } from '@angular/core';
import { LowerCasePipe } from '@angular/common';

import { createSignalFormFieldState } from '../../../utils/signal-form-field-state.util';

@Component({
  selector: 'gm-input',
  imports: [MatInput, FormField, MatFormField, MatLabel, LowerCasePipe, MatError],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent {
  field = input.required<Field<string>>();
  fieldLabel = input<string | null>(null);
  fieldPlaceholder = input<string | null>(null);
  fieldType = input<string>('text');

  private readonly fieldState = createSignalFormFieldState(this.field);
  readonly state = this.fieldState.state;
  readonly errors = this.fieldState.errors;
  readonly showErrors = this.fieldState.showErrors;
}
