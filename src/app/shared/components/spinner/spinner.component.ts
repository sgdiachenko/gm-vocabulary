import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Component } from '@angular/core';

@Component({
  selector: 'gm-spinner',
  imports: [
    MatProgressSpinner
  ],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {
}
