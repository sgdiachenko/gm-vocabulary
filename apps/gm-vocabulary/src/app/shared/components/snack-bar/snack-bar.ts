import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

import { SnackBarData, SnackBarType } from './snack-bar-data';

@Component({
  selector: 'gm-snack-bar',
  imports: [],
  templateUrl: './snack-bar.html',
  styleUrl: './snack-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnackBar {
  protected readonly data = inject<SnackBarData>(MAT_SNACK_BAR_DATA);
  private readonly snackBarRef = inject(MatSnackBarRef<SnackBar>);

  protected readonly containerClasses = computed(() => this.containerClassesByType[this.data.type]);
  protected readonly iconClasses = computed(() => this.iconClassesByType[this.data.type]);
  protected readonly messages = Array.isArray(this.data.message)
    ? this.data.message
    : [this.data.message];

  private readonly containerClassesByType: Record<SnackBarType, string> = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    error: 'border-red-200 bg-red-50 text-red-950',
    warning: 'border-amber-200 bg-amber-50 text-amber-950',
    info: 'border-sky-200 bg-sky-50 text-sky-950',
  };

  private readonly iconClassesByType: Record<SnackBarType, string> = {
    success: 'bg-emerald-100 text-emerald-600',
    error: 'bg-red-100 text-red-600',
    warning: 'bg-amber-100 text-amber-600',
    info: 'bg-sky-100 text-sky-600',
  };

  protected dismiss(): void {
    this.snackBarRef.dismiss();
  }
}
