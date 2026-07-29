import { LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FormField } from '@angular/forms/signals';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';

import { createSignalFormFieldState } from '../../../utils/signal-form-field-state.util';

@Component({
  selector: 'gm-textarea',
  imports: [
    FormField,
    LowerCasePipe,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
  ],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaComponent {
  readonly field = input.required<Field<string>>();
  readonly fieldLabel = input<string | null>(null);
  readonly fieldPlaceholder = input<string | null>(null);
  readonly rows = input(2);

  private readonly fieldState = createSignalFormFieldState(this.field);
  readonly state = this.fieldState.state;
  readonly errors = this.fieldState.errors;
  readonly showErrors = this.fieldState.showErrors;
}
