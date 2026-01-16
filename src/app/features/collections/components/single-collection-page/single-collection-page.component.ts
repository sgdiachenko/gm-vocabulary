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
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  Signal
} from '@angular/core';

import { WordEditDialogComponent } from '../../../words/components/word-edit-dialog/word-edit-dialog.component';
import { SubmitDialogComponent } from '../../../../shared/components/submit-dialog/submit-dialog.component';
import { CollectionEditDialogComponent } from '../collection-edit-dialog/collection-edit-dialog.component';
import { WordEditDialogData } from '../../../words/components/word-edit-dialog/word-edit-dialog-data';
import { WordsTableColumns } from '../../../words/components/words-table/words-table-columns.const';
import { WordsTableComponent } from '../../../words/components/words-table/words-table.component';
import { SubmitDialogData } from '../../../../shared/components/submit-dialog/submit-dialog-data';
import { WordsTableService } from '../../../words/services/words-table/words-table.service';
import {
  DataLoadingWrapperComponent
} from '../../../../shared/components/data-loading-wrapper/data-loading-wrapper.component';
import { WordGroupService } from '../../../../services/word-group/word-group.service';
import { WordsTableRow } from '../../../words/components/words-table/words-table-row';
import { DefaultOptionValueEnum } from '../../../../enums/default-option-value.enum';
import { WordGroupParameterEnum } from '../../../../enums/word-group.parameter.enum';
import { TableColumn } from '../../../../shared/components/table/table-column';
import { SelectOption } from '../../../../shared/interfaces/select-option';
import { WordParameterEnum } from '../../../../enums/word.parameter.enum';
import { WordsService } from '../../../../services/words/words.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { WordGroup } from '../../../../interfaces/word-group';
import { Word } from '../../../../interfaces/word';

@Component({
  selector: 'gm-single-collection-page',
  imports: [
    DataLoadingWrapperComponent,
    WordsTableComponent,
    MatIcon,
    MatMiniFabButton,
    MatTooltip,
    NgClass
  ],
  templateUrl: './single-collection-page.component.html',
  styleUrl: './single-collection-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SingleCollectionPageComponent implements OnInit, OnDestroy {
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
  readonly wordsTable: Signal<WordsTableRow[]> = this.wordsTableService.getTableData(this.words, this.wordGroups);
  readonly selectedGroup = computed(() => this.wordGroups()?.[0]);

  readonly isCollectionOwnerActive: Signal<boolean> = computed(() => {
    return this.selectedGroup()?.[WordGroupParameterEnum.USER_ID] === this.authService.userId();
  });

  readonly fetchIsLoading: Signal<boolean> = this.wordGroupService.fetchIsLoading;
  readonly fetchError: Signal<Error> = this.wordGroupService.fetchError;
  readonly deleteIsLoading: Signal<boolean> = this.wordGroupService.deleteIsLoading;
  readonly deleteError: Signal<Error> = this.wordGroupService.deleteError;

  private wordEditDialogRef!: MatDialogRef<WordEditDialogComponent>;
  private wordsDeleteDialogRef!: MatDialogRef<SubmitDialogComponent>;
  private wordGroupDialogRef: MatDialogRef<CollectionEditDialogComponent>;

  readonly wordsTableColumns: Signal<TableColumn[]> = computed(() => {
    return WordsTableColumns.filter(column => {
      // hide the group name column
      return column.name !== WordParameterEnum.GROUP_NAME;
    })
  });

  ngOnInit(): void {
    this.route.params
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(({collectionId}) => {
          return this.wordGroupService.getGroup(collectionId).pipe(
            tap((wordGroup: WordGroup) => {
              this.wordsService.addWords(wordGroup[WordGroupParameterEnum.WORDS] ?? []);
              this.titleService.setTitle(collectionId !== DefaultOptionValueEnum.ALL ? `${wordGroup?.[WordGroupParameterEnum.NAME]} Collection` : 'Words');
            })
          )
        })
      ).subscribe();
  }

  openEditDialog(word?: Word) {
    this.wordEditDialogRef = this.dialog.open<WordEditDialogComponent, WordEditDialogData | {}>(WordEditDialogComponent, {
      data: {
        ...(word ?? {}),
        groupId: this.selectedGroup()[WordGroupParameterEnum.ID],
        wordGroups: this.wordGroupOptions(),
        disableGroupSelection: true
      }
    });
  }

  openEditWordGroupDialog() {
    this.wordGroupDialogRef = this.dialog.open<CollectionEditDialogComponent, WordGroup | {}>(CollectionEditDialogComponent, {
      data: this.selectedGroup()
    });
  }

  deleteWords(words: Word[]) {
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
    this.wordGroupDialogRef?.close();
    this.wordsService.resetStore();
    this.wordGroupService.resetStore();
  }
}
