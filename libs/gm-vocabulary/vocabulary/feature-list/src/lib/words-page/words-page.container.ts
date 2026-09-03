import { Component, computed, DestroyRef, inject, OnDestroy, OnInit, Signal } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { SubmitDialogComponent } from '@gm-vocabulary/shared/ui';
import { SubmitDialogData } from '@gm-vocabulary/shared/ui';
import { DataLoadingWrapperComponent } from '@gm-vocabulary/shared/ui';
import { WordEditDialogComponent } from '@gm-vocabulary/vocabulary/feature-editor';
import { WordGroupService } from '@gm-vocabulary/collections/data-access';
import { WordEditDialogData } from '@gm-vocabulary/vocabulary/feature-editor';
import { TableColumn } from '@gm-vocabulary/shared/ui';
import { WordsTableColumns } from '@gm-vocabulary/vocabulary/ui';
import { WordsTableComponent } from '@gm-vocabulary/vocabulary/ui';
import { SelectOption } from '@gm-vocabulary/shared/util';
import { getErrorSnackBarData } from '@gm-vocabulary/shared/ui';
import { SnackBarData } from '@gm-vocabulary/shared/ui';
import { WordsTableService } from '@gm-vocabulary/vocabulary/ui';
import { WordParameterEnum } from '@gm-vocabulary/vocabulary/util';
import { WordsTableRow } from '@gm-vocabulary/vocabulary/ui';
import { WordsService } from '@gm-vocabulary/vocabulary/data-access';
import { Word } from '@gm-vocabulary/vocabulary/util';
import { WordsPreviewDialog, WordsPreviewDialogData } from '@gm-vocabulary/vocabulary/ui';

@Component({
  selector: 'gm-words-page',
  imports: [WordsTableComponent, DataLoadingWrapperComponent],
  templateUrl: './words-page.container.html',
  styleUrl: './words-page.container.scss',
})
export class WordsPageContainer implements OnInit, OnDestroy {
  private readonly wordsService = inject(WordsService);
  private readonly wordGroupService = inject(WordGroupService);
  private readonly wordsTableService = inject(WordsTableService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly words: Signal<WordsTableRow[]> = this.wordsTableService.getTableData(
    this.wordsService.filteredWords,
    this.wordGroupService.groups,
  );
  readonly wordGroupOptions: Signal<SelectOption[]> = this.wordGroupService.getWordGroupOptions;
  readonly wordsTableColumns: TableColumn[] = WordsTableColumns;

  readonly fetchIsLoading: Signal<boolean> = this.wordsService.fetchIsLoading;
  readonly deleteIsLoading: Signal<boolean> = this.wordsService.deleteIsLoading;
  readonly snackBarData: Signal<SnackBarData | null> = computed(() =>
    getErrorSnackBarData(this.wordsService.fetchError() || this.wordsService.deleteError()),
  );

  private wordEditDialogRef!: MatDialogRef<WordEditDialogComponent>;
  private wordsDeleteDialogRef!: MatDialogRef<SubmitDialogComponent>;
  private wordsPreviewDialogRef!: MatDialogRef<WordsPreviewDialog>;

  ngOnInit(): void {
    forkJoin([this.wordsService.getWords(), this.wordGroupService.getUserGroups()])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  selectGroup(groupId: string): void {
    this.wordsService.filterByGroupId(groupId);
  }

  openEditDialog(word?: Word): void {
    this.wordEditDialogRef = this.dialog.open<WordEditDialogComponent, WordEditDialogData>(
      WordEditDialogComponent,
      {
        data: {
          ...(word ?? {}),
          wordGroups: this.wordGroupOptions() ?? [],
        },
      },
    );
  }

  deleteWords(words: Word[]): void {
    this.wordsDeleteDialogRef = this.dialog.open<SubmitDialogComponent, SubmitDialogData>(
      SubmitDialogComponent,
      {
        data: {
          title: 'Delete',
          text: 'Are you sure you want to delete selected words?',
        },
      },
    );

    this.wordsDeleteDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.wordsService
          .deleteWords(words.map((word) => word[WordParameterEnum.ID]))
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe();
      }
    });
  }

  previewWords(words: Word[]): void {
    this.wordsPreviewDialogRef = this.dialog.open<WordsPreviewDialog, WordsPreviewDialogData>(
      WordsPreviewDialog,
      {
        data: { words },
        maxWidth: '95vw',
      },
    );
  }

  ngOnDestroy(): void {
    this.wordEditDialogRef?.close();
    this.wordsDeleteDialogRef?.close();
    this.wordsPreviewDialogRef?.close();
    this.wordsService.resetStore();
    this.wordGroupService.resetStore();
  }
}
