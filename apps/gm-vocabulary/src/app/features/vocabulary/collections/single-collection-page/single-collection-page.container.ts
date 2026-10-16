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

import { WordEditDialogComponent } from '../../words/word-edit-dialog/word-edit-dialog.component';
import { SubmitDialogComponent } from '../../../../shared/ui/submit-dialog/submit-dialog.component';
import { CollectionEditDialogComponent } from '../collection-edit-dialog/collection-edit-dialog.component';
import { WordEditDialogData } from '../../words/word-edit-dialog/word-edit-dialog-data';
import { WordsTableColumns } from '../../words/words-table/words-table-columns.const';
import { WordsTableComponent } from '../../words/words-table/words-table.component';
import { SubmitDialogData } from '../../../../shared/ui/submit-dialog/submit-dialog-data';
import { WordsTableService } from '../../words/words-table/words-table.service';
import { DataLoadingWrapperComponent } from '../../../../shared/ui/data-loading-wrapper/data-loading-wrapper.component';
import { DefaultOptionValueEnum } from '../../../../shared/forms/default-option-value.enum';
import { WordGroupService } from '../word-group.service';
import { WordsTableRow } from '../../words/words-table/words-table-row';
import { WordGroup } from '../contracts/word-group';
import { WordGroupParameterEnum } from '../contracts/word-group.parameter.enum';
import { TableColumn } from '../../../../shared/ui/table/table-column';
import { WordParameterEnum } from '../../words/contracts/word.parameter.enum';
import { SelectOption } from '../../../../shared/forms/select-option';
import { getErrorSnackBarData } from '../../../../shared/ui/snack-bar/get-error-snack-bar-data.util';
import { SnackBarData } from '../../../../shared/ui/snack-bar/snack-bar-data';
import { WordsService } from '../../words/words.service';
import { AuthService } from '../../../auth/auth.service';
import { Word } from '../../words/contracts/word';
import {
  WordsPreviewDialog,
  WordsPreviewDialogData,
} from '../../words/words-preview-dialog/words-preview-dialog';

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
