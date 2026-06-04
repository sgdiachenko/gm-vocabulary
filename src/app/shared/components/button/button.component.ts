import { Component, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'gm-button',
  imports: [
    MatButton
  ],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  isDisabled = input(false);
  isPrimary = input(false);
  isSubmit = input(false);
  btnClick = output();
}
