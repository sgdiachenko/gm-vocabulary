import { Component, input, model } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'gm-checkbox',
  imports: [MatCheckbox],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss',
})
export class Checkbox {
  readonly checked = model(false);
  readonly disabled = input(false);
  readonly indeterminate = input(false);
}
