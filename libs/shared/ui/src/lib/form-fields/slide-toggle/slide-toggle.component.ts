import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatError } from '@angular/material/input';
import { Field, FormField } from '@angular/forms/signals';
import { Component, input } from '@angular/core';

import { createSignalFormFieldState } from '@gm-vocabulary/shared/util';

@Component({
  selector: 'gm-slide-toggle',
  imports: [MatSlideToggle, FormField, MatError],
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
