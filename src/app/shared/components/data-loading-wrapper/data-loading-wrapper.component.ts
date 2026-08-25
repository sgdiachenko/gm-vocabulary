import { Component, inject, input, OnChanges, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SpinnerComponent } from '../spinner/spinner.component';
import { SnackBarData } from '../snack-bar/snack-bar-data';
import { SnackBar } from '../snack-bar/snack-bar';

@Component({
  selector: 'gm-data-loading-wrapper',
  imports: [SpinnerComponent],
  templateUrl: './data-loading-wrapper.component.html',
  styleUrl: './data-loading-wrapper.component.scss',
})
export class DataLoadingWrapperComponent implements OnChanges {
  loadingState = input<boolean>(false);
  snackBarData = input<SnackBarData | null>(null);

  private readonly snackBar = inject(MatSnackBar);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['snackBarData'] == null) {
      return;
    }

    const data = this.snackBarData();
    data == null
      ? this.snackBar.dismiss()
      : this.snackBar.openFromComponent(SnackBar, {
          data,
          panelClass: 'gm-snack-bar-panel',
        });
  }
}
