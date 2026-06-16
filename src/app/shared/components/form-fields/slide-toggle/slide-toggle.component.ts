import { MatSlideToggle } from '@angular/material/slide-toggle';
import { Field, FormField } from '@angular/forms/signals';
import { Component, input } from '@angular/core';

import { createSignalFormFieldState } from '../../../utils/signal-form-field-state.util';

@Component({
  selector: 'gm-slide-toggle',
  imports: [
    MatSlideToggle,
    FormField,
  ],
  templateUrl: './slide-toggle.component.html',
  styleUrl: './slide-toggle.component.scss',
})
export class SlideToggleComponent {
  field = input.required<Field<boolean>>();

  private readonly fieldState = createSignalFormFieldState(this.field);
  readonly state = this.fieldState.state;
  readonly errors = this.fieldState.errors;
  readonly showErrors = this.fieldState.showErrors;
}
