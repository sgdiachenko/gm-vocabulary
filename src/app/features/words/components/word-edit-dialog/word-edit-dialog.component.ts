import { ChangeDetectionStrategy, Component, inject, Signal, signal, WritableSignal } from '@angular/core';
import { disabled, FieldTree, form, required, FormField } from '@angular/forms/signals'
import { defer, iif, of, switchMap } from 'rxjs';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';

import { AutocompleteComponent } from '../../../../shared/components/autocomplete/autocomplete.component';
import { WordParameterDisplayNameEnum } from '../../../../enums/word-parameter-display-name.enum';
import {
  DataLoadingWrapperComponent
} from '../../../../shared/components/data-loading-wrapper/data-loading-wrapper.component';
import {
  FormFieldValidationService
} from '../../../../shared/services/form-field-validation/form-field-validation.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { WordGroupService } from '../../../../services/word-group/word-group.service';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { WordGroupParameterEnum } from '../../../../enums/word-group.parameter.enum';
import { WordParameterEnum } from '../../../../enums/word.parameter.enum';
import { WordsService } from '../../../../services/words/words.service';
import { WordGroup } from '../../../../interfaces/word-group';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WordEditDialogComponent {
  private dialogRef = inject(MatDialogRef<WordEditDialogData>);
  data: WordEditDialogData = inject<WordEditDialogData>(MAT_DIALOG_DATA);

  private readonly wordsService = inject(WordsService);
  private readonly wordGroupService = inject(WordGroupService);
  private readonly formFieldValidationService = inject(FormFieldValidationService);
  private readonly wordGroups: Signal<WordGroup[]> = this.wordGroupService.groups;

  readonly wordParameterEnum = WordParameterEnum;
  readonly wordParameterDisplayNameEnum = WordParameterDisplayNameEnum;

  wordsUpdateIsLoading: Signal<boolean> = this.wordsService.updateIsLoading;
  wordsUpdateErr: Signal<Error> = this.wordsService.updateError;

  private wordModel: WritableSignal<WordForm> = signal<WordForm>({
    [WordParameterEnum.WORD]: this.data?.[WordParameterEnum.WORD] ?? '',
    [WordParameterEnum.TRANSLATION]: this.data?.[WordParameterEnum.TRANSLATION] ?? '',
    [WordParameterEnum.GROUP_ID]: this.data?.[WordParameterEnum.GROUP_ID] ?? ''
  });

  wordForm: FieldTree<WordForm> = form(this.wordModel,  (schemaPath) => {
    required(schemaPath[WordParameterEnum.WORD], { message: 'Word is required' })
    required(schemaPath[WordParameterEnum.TRANSLATION], { message: 'Translation is required' })
    disabled(schemaPath[WordParameterEnum.GROUP_ID], () => this.data.disableGroupSelection)
  });

  isWordFormValid = this.formFieldValidationService.isSignalFormValid<WordForm>(this.wordForm);
  getFormFieldErrors = this.formFieldValidationService.getSignalFormFieldErrorMessages;

  apply(): void {
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
    ).subscribe({
      next: () => {
        this.close();
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
