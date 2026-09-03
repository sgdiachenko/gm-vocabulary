import {
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { FieldTree, form, required } from '@angular/forms/signals';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

import { DataLoadingWrapperComponent } from '@gm-vocabulary/shared/ui';
import { SlideToggleComponent } from '@gm-vocabulary/shared/ui';
import { WordGroupParameterDisplayNameEnum } from '@gm-vocabulary/collections/util';
import { InputComponent } from '@gm-vocabulary/shared/ui';
import { ButtonComponent } from '@gm-vocabulary/shared/ui';
import { WordGroupService } from '@gm-vocabulary/collections/data-access';
import { WordGroupParameterEnum } from '@gm-vocabulary/collections/util';
import { WordGroupRequest } from '@gm-vocabulary/collections/util';
import { WordGroup } from '@gm-vocabulary/collections/util';
import { getErrorSnackBarData } from '@gm-vocabulary/shared/ui';
import { SnackBarData } from '@gm-vocabulary/shared/ui';

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
    const saveRequest: Observable<WordGroup | void> =
      groupId == null
        ? this.wordGroupService.addGroup(this.formModel())
        : this.wordGroupService.updateGroup(groupId, this.formModel());

    saveRequest.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.close();
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
