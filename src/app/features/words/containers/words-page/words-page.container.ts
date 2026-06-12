import { Component, DestroyRef, inject, OnDestroy, OnInit, Signal } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { SubmitDialogComponent } from '../../../../shared/components/submit-dialog/submit-dialog.component';
import { SubmitDialogData } from '../../../../shared/components/submit-dialog/submit-dialog-data';
import {
  DataLoadingWrapperComponent
} from '../../../../shared/components/data-loading-wrapper/data-loading-wrapper.component';
import { WordEditDialogComponent } from '../../components/word-edit-dialog/word-edit-dialog.component';
import { WordGroupService } from '../../../word-sets/services/word-group/word-group.service';
import { WordEditDialogData } from '../../components/word-edit-dialog/word-edit-dialog-data';
import { TableColumn } from '../../../../shared/components/table/table-column';
import { WordsTableColumns } from '../../components/words-table/words-table-columns.const';
import { WordsTableComponent } from '../../components/words-table/words-table.component';
import { SelectOption } from '../../../../shared/interfaces/select-option';
import { WordsTableService } from '../../services/words-table/words-table.service';
import { WordParameterEnum } from '../../enums/word.parameter.enum';
import { WordsTableRow } from '../../components/words-table/words-table-row';
import { WordsService } from '../../services/words/words.service';
import { Word } from '../../interfaces/word';


@Component({
  selector: 'gm-words-page',
  imports: [
    WordsTableComponent,
    DataLoadingWrapperComponent,
  ],
  templateUrl: './words-page.container.html',
  styleUrl: './words-page.container.scss'
})
export class WordsPageContainer implements OnInit, OnDestroy {
  private readonly wordsService = inject(WordsService);
  private readonly wordGroupService = inject(WordGroupService);
  private readonly wordsTableService = inject(WordsTableService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly words: Signal<WordsTableRow[]> = this.wordsTableService.getTableData(this.wordsService.filteredWords, this.wordGroupService.groups);
  readonly wordGroupOptions: Signal<SelectOption[]> = this.wordGroupService.getWordGroupOptions;
  readonly wordsTableColumns: TableColumn[] = WordsTableColumns;

  readonly fetchIsLoading: Signal<boolean> = this.wordsService.fetchIsLoading;
  readonly fetchError: Signal<Error> = this.wordsService.fetchError;
  readonly deleteIsLoading: Signal<boolean> = this.wordsService.deleteIsLoading;
  readonly deleteError: Signal<Error> = this.wordsService.deleteError;

  private wordEditDialogRef!: MatDialogRef<any>;
  private wordsDeleteDialogRef!: MatDialogRef<any>;

  ngOnInit(): void {
    forkJoin([
      this.wordsService.getWords(),
      this.wordGroupService.getUserGroups(),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  selectGroup(groupId: string): void {
    this.wordsService.filterByGroupId(groupId);
  }

  openEditDialog(word?: Word): void {
    this.wordEditDialogRef = this.dialog.open<WordEditDialogComponent, WordEditDialogData | {}>(WordEditDialogComponent, {
      data: {
        ...(word ?? {}),
        wordGroups: this.wordGroupOptions() ?? []
      }
    });
  }

  deleteWords(words: Word[]): void {
    this.wordsDeleteDialogRef = this.dialog.open<SubmitDialogComponent, SubmitDialogData>(SubmitDialogComponent, {
      data: {
        title: 'Delete',
        text: 'Are you sure you want to delete selected words?'
      }
    });

    this.wordsDeleteDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.wordsService.deleteWords(words.map(word => word[WordParameterEnum.ID])).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      }
    });
  }

  ngOnDestroy(): void {
    this.wordEditDialogRef?.close();
    this.wordsDeleteDialogRef?.close();
    this.wordsService.resetStore();
    this.wordGroupService.resetStore();
  }
}
