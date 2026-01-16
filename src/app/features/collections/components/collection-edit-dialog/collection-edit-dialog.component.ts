import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { Field, FieldTree, form, required } from '@angular/forms/signals';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { defer, iif } from 'rxjs';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';

import { DataLoadingWrapperComponent } from '../../../../shared/components/data-loading-wrapper/data-loading-wrapper.component';
import { WordGroupParameterDisplayNameEnum } from '../../../../enums/word-group-parameter-display-name.enum';
import { WordEditDialogData } from '../../../words/components/word-edit-dialog/word-edit-dialog-data';
import {
  FormFieldValidationService
} from '../../../../shared/services/form-field-validation/form-field-validation.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { WordGroupService } from '../../../../services/word-group/word-group.service';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { WordGroupParameterEnum } from '../../../../enums/word-group.parameter.enum';
import { WordGroupRequest } from '../../../../interfaces/word-group-request';
import { WordGroup } from '../../../../interfaces/word-group';

@Component({
  selector: 'gm-collection-edit-dialog',
  imports: [
    DataLoadingWrapperComponent,
    ButtonComponent,
    InputComponent,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    Field,
    MatSlideToggle,
  ],
  templateUrl: './collection-edit-dialog.component.html',
  styleUrl: './collection-edit-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionEditDialogComponent {
  private dialogRef = inject(MatDialogRef<WordGroup | void>);
  data: WordEditDialogData = inject<WordEditDialogData>(MAT_DIALOG_DATA);

  private readonly destroyRef = inject(DestroyRef);
  private readonly wordGroupService = inject(WordGroupService);
  private readonly formFieldValidationService = inject(FormFieldValidationService);

  updateIsLoading: WritableSignal<boolean> = this.wordGroupService.deleteIsLoading;
  updateError: WritableSignal<Error> = this.wordGroupService.updateError;

  readonly wordGroupParameterEnum = WordGroupParameterEnum;
  readonly wordGroupParameterDisplayNameEnum = WordGroupParameterDisplayNameEnum;

  private formModel: WritableSignal<WordGroupRequest> = signal<WordGroupRequest>({
    [WordGroupParameterEnum.NAME]: this.data?.[WordGroupParameterEnum.NAME] ?? '',
    [WordGroupParameterEnum.IS_SHARED]: this.data?.[WordGroupParameterEnum.IS_SHARED] ?? false,
  });

  wordGroupForm: FieldTree<WordGroupRequest> = form(this.formModel,  (schemaPath) => {
    required(schemaPath[WordGroupParameterEnum.NAME], { message: 'Name is required' })
  });

  isWordGroupFormValid = this.formFieldValidationService.isSignalFormValid<WordGroupRequest>(this.wordGroupForm);
  getFormFieldErrors = this.formFieldValidationService.getSignalFormFieldErrorMessages;

  apply(): void {
    iif(
      () => this.data == null,
      defer(() => this.wordGroupService.addGroup(this.formModel())),
      defer(() => this.wordGroupService.updateGroup(this.data._id, this.formModel()))
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.close();
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}
