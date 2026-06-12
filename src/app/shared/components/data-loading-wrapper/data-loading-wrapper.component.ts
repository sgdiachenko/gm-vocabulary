import { Component, inject, input, OnChanges, SimpleChanges } from '@angular/core';

import { SpinnerComponent } from "../spinner/spinner.component";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'gm-data-loading-wrapper',
  imports: [
    SpinnerComponent
  ],
  templateUrl: './data-loading-wrapper.component.html',
  styleUrl: './data-loading-wrapper.component.scss',
})
export class DataLoadingWrapperComponent implements OnChanges {

  loadingState = input<boolean>(false);
  error = input<Error>(null);
  successMessage = input<string>(null);

  private _snackBar = inject(MatSnackBar);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['error'] != null) {
      if (this.error() == null) {
        this._snackBar.dismiss();
      } else {
        this._snackBar.open(this.error().message, 'Close');
      }
    }

    if (changes['successMessage'] != null) {
      if (this.successMessage() == null) {
        this._snackBar.dismiss();
      } else {
        this._snackBar.open(this.successMessage(), 'Close');
      }
    }
  }
}
