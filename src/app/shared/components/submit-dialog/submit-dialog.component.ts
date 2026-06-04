import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';

import { ButtonComponent } from '../button/button.component';
import { SubmitDialogData } from './submit-dialog-data';

@Component({
  selector: 'gm-submit-dialog',
  imports: [
    ButtonComponent,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle
  ],
  templateUrl: './submit-dialog.component.html',
  styleUrl: './submit-dialog.component.scss',
})
export class SubmitDialogComponent {
  dialogRef = inject(MatDialogRef<SubmitDialogData>);
  data: SubmitDialogData = inject<SubmitDialogData>(MAT_DIALOG_DATA);

  close(submit?: boolean): void {
    this.dialogRef.close(submit);
  }
}
