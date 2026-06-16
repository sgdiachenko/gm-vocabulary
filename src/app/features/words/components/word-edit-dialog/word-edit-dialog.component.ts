import { Component, DestroyRef, inject, Signal, signal, WritableSignal } from '@angular/core';
import { disabled, FieldTree, form, FormField, required } from '@angular/forms/signals';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { defer, iif, of, switchMap } from 'rxjs';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';

import { AutocompleteComponent } from '../../../../shared/components/form-fields/autocomplete/autocomplete.component';
import { InputComponent } from '../../../../shared/components/form-fields/input/input.component';
import { WordGroupService } from '../../../word-sets/services/word-group/word-group.service';
import { WordParameterDisplayNameEnum } from '../../enums/word-parameter-display-name.enum';
import { WordGroupParameterEnum } from '../../../word-sets/enums/word-group.parameter.enum';
import {
  DataLoadingWrapperComponent
} from '../../../../shared/components/data-loading-wrapper/data-loading-wrapper.component';
import {
  FormFieldValidationService
} from '../../../../shared/services/form-field-validation/form-field-validation.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { WordGroup } from '../../../../features/word-sets/interfaces/word-group';
import { WordParameterEnum } from '../../enums/word.parameter.enum';
import { WordsService } from '../../services/words/words.service';
import { WordEditDialogData } from './word-edit-dialog-data';
import { WordForm } from './word-form';

@Component({
  selector: 'gm-word-edit-dialog',
  imports: [
    MatDialogContent,
    MatDialogTitle,
    ButtonComponent,
    MatDialogActions,
    InputComponent,
    DataLoadingWrapperComponent,
    AutocompleteComponent,
    FormField
],
  templateUrl: './word-edit-dialog.component.html',
  styleUrl: './word-edit-dialog.component.scss',
})
export class WordEditDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<WordEditDialogComponent>);
  private readonly destroyRef = inject(DestroyRef);
  readonly data: WordEditDialogData = inject<WordEditDialogData>(MAT_DIALOG_DATA);

  private readonly wordsService = inject(WordsService);
  private readonly wordGroupService = inject(WordGroupService);
  private readonly formFieldValidationService = inject(FormFieldValidationService);
  private readonly wordGroups: Signal<WordGroup[]> = this.wordGroupService.groups;

  readonly wordParameterEnum = WordParameterEnum;
  readonly wordParameterDisplayNameEnum = WordParameterDisplayNameEnum;

  wordsUpdateIsLoading: Signal<boolean> = this.wordsService.updateIsLoading;
  wordsUpdateErr: Signal<Error> = this.wordsService.updateError;

  private readonly wordModel: WritableSignal<WordForm> = signal<WordForm>({
    [WordParameterEnum.WORD]: this.data?.[WordParameterEnum.WORD] ?? '',
    [WordParameterEnum.TRANSLATION]: this.data?.[WordParameterEnum.TRANSLATION] ?? '',
    [WordParameterEnum.GROUP_ID]: this.data?.[WordParameterEnum.GROUP_ID] ?? ''
  });

  readonly wordForm: FieldTree<WordForm> = form(this.wordModel, (schemaPath) => {
    required(schemaPath[WordParameterEnum.WORD], { message: 'Word is required' });
    required(schemaPath[WordParameterEnum.TRANSLATION], { message: 'Translation is required' });
    disabled(schemaPath[WordParameterEnum.GROUP_ID], () => this.data.disableGroupSelection);
  });

  readonly isWordFormValid = this.formFieldValidationService.isSignalFormValid<WordForm>(this.wordForm);
  readonly getFormFieldErrors = this.formFieldValidationService.getSignalFormFieldErrorMessages;

  apply(): void {
    if (!this.isWordFormValid()) {
      return;
    }

    const selectedGroupId = this.wordModel()[WordParameterEnum.GROUP_ID]?.trim();
    const isNewGroupSelected = selectedGroupId != null && selectedGroupId !== ''
      && this.wordGroups().findIndex(({_id}) => _id === selectedGroupId) === -1;

    iif(
      () => isNewGroupSelected,
      defer(() => this.wordGroupService.addGroup({ [WordGroupParameterEnum.NAME]: selectedGroupId })),
      of(null)
    ).pipe(
      switchMap(newGroupsRes => {
        const groupId = isNewGroupSelected
          ? newGroupsRes[WordGroupParameterEnum.ID]
          : (selectedGroupId !== '' ? selectedGroupId : null);

        if (this.data?._id == null) {
          return this.wordsService.addWord({
            ...this.wordModel(),
            [WordParameterEnum.GROUP_ID]: groupId
          });
        }

        return this.wordsService.updateWord(
          this.data._id,
          {
            ...this.wordModel(),
            [WordParameterEnum.GROUP_ID]: groupId
          }
        );
      })
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.close();
        }
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}
