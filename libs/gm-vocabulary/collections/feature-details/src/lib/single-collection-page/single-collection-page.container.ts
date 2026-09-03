import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatMiniFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { switchMap } from 'rxjs/operators';
import { NgClass } from '@angular/common';
import { tap } from 'rxjs';
import { Component, computed, DestroyRef, inject, OnDestroy, OnInit, Signal } from '@angular/core';

import { WordEditDialogComponent } from '@gm-vocabulary/vocabulary/feature-editor';
import { SubmitDialogComponent } from '@gm-vocabulary/shared/ui';
import { CollectionEditDialogComponent } from '@gm-vocabulary/collections/feature-editor';
import { WordEditDialogData } from '@gm-vocabulary/vocabulary/feature-editor';
import { WordsTableColumns } from '@gm-vocabulary/vocabulary/ui';
import { WordsTableComponent } from '@gm-vocabulary/vocabulary/ui';
import { SubmitDialogData } from '@gm-vocabulary/shared/ui';
import { WordsTableService } from '@gm-vocabulary/vocabulary/ui';
import { DataLoadingWrapperComponent } from '@gm-vocabulary/shared/ui';
import { DefaultOptionValueEnum } from '@gm-vocabulary/shared/util';
import { WordGroupService } from '@gm-vocabulary/collections/data-access';
import { WordsTableRow } from '@gm-vocabulary/vocabulary/ui';
import { WordGroup } from '@gm-vocabulary/collections/util';
import { WordGroupParameterEnum } from '@gm-vocabulary/collections/util';
import { TableColumn } from '@gm-vocabulary/shared/ui';
import { WordParameterEnum } from '@gm-vocabulary/vocabulary/util';
import { SelectOption } from '@gm-vocabulary/shared/util';
import { getErrorSnackBarData } from '@gm-vocabulary/shared/ui';
import { SnackBarData } from '@gm-vocabulary/shared/ui';
import { WordsService } from '@gm-vocabulary/vocabulary/data-access';
import { AuthService } from '@gm-vocabulary/auth/data-access';
import { Word } from '@gm-vocabulary/vocabulary/util';
import { WordsPreviewDialog, WordsPreviewDialogData } from '@gm-vocabulary/vocabulary/ui';

@Component({
  selector: 'gm-single-collection-page',
  imports: [
    DataLoadingWrapperComponent,
    WordsTableComponent,
    MatIcon,
    MatMiniFabButton,
    MatTooltip,
    NgClass,
  ],
  templateUrl: './single-collection-page.container.html',
  styleUrl: './single-collection-page.container.scss',
})
export class SingleCollectionPageContainer implements OnInit, OnDestroy {
  private readonly authService: AuthService = inject(AuthService);
  private readonly wordsService: WordsService = inject(WordsService);
  private readonly wordsTableService: WordsTableService = inject(WordsTableService);
  private readonly wordGroupService: WordGroupService = inject(WordGroupService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly titleService: Title = inject(Title);

  private readonly wordGroups: Signal<WordGroup[]> = this.wordGroupService.groups;
  readonly wordGroupOptions: Signal<SelectOption[]> = this.wordGroupService.getWordGroupOptions;
  private readonly words: Signal<Word[]> = this.wordsService.words;
  readonly wordsTable: Signal<WordsTableRow[]> = this.wordsTableService.getTableData(
    this.words,
    this.wordGroups,
  );
  readonly selectedGroup: Signal<WordGroup | undefined> = computed(() => this.wordGroups()[0]);

  readonly isCollectionOwnerActive: Signal<boolean> = computed(() => {
    return this.selectedGroup()?.[WordGroupParameterEnum.USER_ID] === this.authService.userId();
  });

  readonly fetchIsLoading: Signal<boolean> = this.wordGroupService.fetchIsLoading;
  readonly deleteIsLoading: Signal<boolean> = this.wordGroupService.deleteIsLoading;
  readonly copyIsLoading: Signal<boolean> = this.wordsService.updateIsLoading;
  readonly snackBarData: Signal<SnackBarData | null> = computed(() =>
    getErrorSnackBarData(
      this.wordGroupService.fetchError() ||
        this.wordGroupService.deleteError() ||
        this.wordsService.updateError(),
    ),
  );

  private wordEditDialogRef?: MatDialogRef<WordEditDialogComponent>;
  private wordsDeleteDialogRef?: MatDialogRef<SubmitDialogComponent>;
  private wordsCopyDialogRef?: MatDialogRef<SubmitDialogComponent>;
  private wordGroupDialogRef?: MatDialogRef<CollectionEditDialogComponent>;
  private wordsPreviewDialogRef?: MatDialogRef<WordsPreviewDialog>;

  readonly wordsTableColumns: Signal<TableColumn[]> = computed(() => {
    return WordsTableColumns.filter((column) => {
      // hide the group name column
      return column.name !== WordParameterEnum.GROUP_NAME;
    });
  });

  ngOnInit(): void {
    this.route.params
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(({ collectionId }) => {
          return this.wordGroupService.getGroup(collectionId).pipe(
            tap((wordGroup: WordGroup) => {
              this.wordsService.addWords(wordGroup[WordGroupParameterEnum.WORDS] ?? []);
              this.titleService.setTitle(
                collectionId !== DefaultOptionValueEnum.ALL
                  ? `${wordGroup?.[WordGroupParameterEnum.NAME]} Collection`
                  : 'Words',
              );
            }),
          );
        }),
      )
      .subscribe();
  }

  openEditDialog(word?: Word) {
    this.wordEditDialogRef = this.dialog.open<WordEditDialogComponent, WordEditDialogData>(
      WordEditDialogComponent,
      {
        data: {
          ...(word ?? {}),
          groupId: this.selectedGroup()?.[WordGroupParameterEnum.ID],
          wordGroups: this.wordGroupOptions(),
          disableGroupSelection: true,
        },
      },
    );
  }

  openEditWordGroupDialog() {
    this.wordGroupDialogRef = this.dialog.open<
      CollectionEditDialogComponent,
      WordGroup | undefined
    >(CollectionEditDialogComponent, {
      data: this.selectedGroup(),
    });
  }

  deleteWords(words: Word[]) {
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

  copyWords(words: Word[]): void {
    this.wordsCopyDialogRef = this.dialog.open<SubmitDialogComponent, SubmitDialogData>(
      SubmitDialogComponent,
      {
        data: {
          title: 'Copy',
          text: 'Are you sure you want to copy selected words?',
        },
      },
    );

    this.wordsCopyDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.wordsService
          .copyWords(words.map((word) => word[WordParameterEnum.ID]))
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
    this.wordsCopyDialogRef?.close();
    this.wordGroupDialogRef?.close();
    this.wordsPreviewDialogRef?.close();
    this.wordsService.resetStore();
    this.wordGroupService.resetStore();
  }
}
