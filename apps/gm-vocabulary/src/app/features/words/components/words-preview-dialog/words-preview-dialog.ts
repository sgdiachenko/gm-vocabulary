import { Component, computed, inject, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

import { WordParameterEnum } from '../../enums/word.parameter.enum';
import { Word } from '../../interfaces/word';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { Checkbox } from '../../../../shared/components/form-fields/checkbox/checkbox';

export interface WordsPreviewDialogData {
  words: Word[];
}

@Component({
  selector: 'gm-words-preview-dialog',
  imports: [
    ButtonComponent,
    Checkbox,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatIcon,
    MatIconButton,
  ],
  templateUrl: './words-preview-dialog.html',
  styleUrl: './words-preview-dialog.scss',
})
export class WordsPreviewDialog {
  private readonly dialogRef = inject(MatDialogRef<WordsPreviewDialog>);

  protected readonly data = inject<WordsPreviewDialogData>(MAT_DIALOG_DATA);
  protected readonly wordParameter = WordParameterEnum;
  protected readonly currentIndex = signal(0);
  protected readonly showName = signal(true);
  protected readonly showTranslation = signal(false);
  protected readonly showDescription = signal(false);

  protected readonly currentWord = computed(() => this.data.words[this.currentIndex()]);
  protected readonly hasMultipleWords = computed(() => this.data.words.length > 1);
  protected readonly hasTranslation = computed(
    () => this.currentWord()?.[WordParameterEnum.TRANSLATION] != null,
  );
  protected readonly hasDescription = computed(
    () => this.currentWord()?.[WordParameterEnum.DESCRIPTION] != null,
  );

  protected showPrevious(): void {
    this.currentIndex.update(
      (index) => (index - 1 + this.data.words.length) % this.data.words.length,
    );
  }

  protected showNext(): void {
    this.currentIndex.update((index) => (index + 1) % this.data.words.length);
  }

  protected close(): void {
    this.dialogRef.close();
  }
}
