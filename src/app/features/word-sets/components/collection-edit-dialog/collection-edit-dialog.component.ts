import { Component, computed, DestroyRef, inject, signal, Signal, WritableSignal } from '@angular/core';
import { FieldTree, form, required } from '@angular/forms/signals';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';

import { DataLoadingWrapperComponent } from '../../../../shared/components/data-loading-wrapper/data-loading-wrapper.component';
import { SlideToggleComponent } from '../../../../shared/components/form-fields/slide-toggle/slide-toggle.component';
import { WordGroupParameterDisplayNameEnum } from '../../enums/word-group-parameter-display-name.enum';
import { InputComponent } from '../../../../shared/components/form-fields/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { WordGroupService } from '../../services/word-group/word-group.service';
import { WordGroupParameterEnum } from '../../enums/word-group.parameter.enum';
import { WordGroupRequest } from '../../interfaces/word-group-request';
import { WordGroup } from '../../interfaces/word-group';
import { getErrorSnackBarData } from '../../../../shared/utils/get-error-snack-bar-data.util';
import { SnackBarData } from '../../../../shared/components/snack-bar/snack-bar-data';

@Component({
  selector: 'gm-collection-edit-dialog',
  imports: [
    DataLoadingWrapperComponent,
    ButtonComponent,
    InputComponent,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    SlideToggleComponent,
  ],
  templateUrl: './collection-edit-dialog.component.html',
  styleUrl: './collection-edit-dialog.component.scss',
})
export class CollectionEditDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CollectionEditDialogComponent>);
  readonly data: WordGroup | undefined = inject<WordGroup | undefined>(MAT_DIALOG_DATA);

  private readonly destroyRef = inject(DestroyRef);
  private readonly wordGroupService = inject(WordGroupService);

  readonly updateIsLoading: Signal<boolean> = this.wordGroupService.updateIsLoading;
  readonly snackBarData: Signal<SnackBarData | null> = computed(() =>
    getErrorSnackBarData(this.wordGroupService.updateError()),
  );

  readonly wordGroupParameterEnum = WordGroupParameterEnum;
  readonly wordGroupParameterDisplayNameEnum = WordGroupParameterDisplayNameEnum;

  private readonly formModel: WritableSignal<WordGroupRequest> = signal<WordGroupRequest>({
    [WordGroupParameterEnum.NAME]: this.data?.[WordGroupParameterEnum.NAME] ?? '',
    [WordGroupParameterEnum.IS_SHARED]: this.data?.[WordGroupParameterEnum.IS_SHARED] ?? false,
  });

  readonly wordGroupForm: FieldTree<WordGroupRequest> = form(this.formModel, (schemaPath) => {
    required(schemaPath[WordGroupParameterEnum.NAME], { message: 'Name is required' });
  });

  readonly isWordGroupFormValid = computed(() => this.wordGroupForm().valid());

  apply(): void {
    if (!this.isWordGroupFormValid()) {
      return;
    }

    const groupId = this.data?.[WordGroupParameterEnum.ID];
    const saveRequest: Observable<WordGroup | void> = groupId == null
      ? this.wordGroupService.addGroup(this.formModel())
      : this.wordGroupService.updateGroup(groupId, this.formModel());

    saveRequest
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.close();
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}
