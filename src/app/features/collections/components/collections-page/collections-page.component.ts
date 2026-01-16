import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  Signal,
  WritableSignal
} from '@angular/core';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatMiniFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { NgTemplateOutlet } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { forkJoin, take } from 'rxjs';

import { DataLoadingWrapperComponent } from '../../../../shared/components/data-loading-wrapper/data-loading-wrapper.component';
import { SubmitDialogComponent } from '../../../../shared/components/submit-dialog/submit-dialog.component';
import { CollectionEditDialogComponent } from '../collection-edit-dialog/collection-edit-dialog.component';
import { SubmitDialogData } from '../../../../shared/components/submit-dialog/submit-dialog-data';
import { WordGroupService } from '../../../../services/word-group/word-group.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { WordGroup } from '../../../../interfaces/word-group';

@Component({
  selector: 'gm-collections-page',
  imports: [
    MatCardTitle,
    MatCard,
    DataLoadingWrapperComponent,
    MatCardContent,
    RouterLink,
    MatIcon,
    MatMiniFabButton,
    NgTemplateOutlet,
    MatTooltip,
  ],
  templateUrl: './collections-page.component.html',
  styleUrl: './collections-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionsPageComponent implements OnInit, OnDestroy {

  private readonly authService: AuthService = inject(AuthService);
  private readonly wordGroupService: WordGroupService = inject(WordGroupService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly dialog: MatDialog = inject(MatDialog);

  readonly collections: Signal<WordGroup[]> = this.wordGroupService.groups;
  readonly sharedCollections: Signal<WordGroup[]> = this.wordGroupService.sharedGroups;
  readonly userId: Signal<string> = this.authService.userId;

  readonly fetchIsLoading: Signal<boolean> = this.wordGroupService.fetchIsLoading;
  readonly fetchError: Signal<Error> = this.wordGroupService.fetchError;
  readonly deleteIsLoading: WritableSignal<boolean> = this.wordGroupService.deleteIsLoading;
  readonly deleteError: WritableSignal<Error> = this.wordGroupService.deleteError;

  private editDialogRef: MatDialogRef<CollectionEditDialogComponent>;
  private deleteDialogRef: MatDialogRef<SubmitDialogComponent>;

  ngOnInit(): void {
    forkJoin([
      this.wordGroupService.getUserGroups(),
      this.wordGroupService.getSharedGroups()
    ]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  openEditDialog(wordGroup?: WordGroup) {
    this.editDialogRef = this.dialog.open<CollectionEditDialogComponent, WordGroup | {}>(CollectionEditDialogComponent, {
      data: wordGroup
    });
  }

  openDeleteDialog(wordGroupId: string) {
    this.deleteDialogRef = this.dialog.open<SubmitDialogComponent, SubmitDialogData>(SubmitDialogComponent, {
      data: {
        title: 'Delete',
        text: 'Are you sure you want to delete selected collection?'
      }
    });

    this.deleteDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.wordGroupService.deleteGroup(wordGroupId)
          .pipe(takeUntilDestroyed(this.destroyRef), take(1))
          .subscribe();
      }
    });
  }

  ngOnDestroy(): void {
    this.editDialogRef?.close();
    this.deleteDialogRef?.close();
    this.wordGroupService.resetStore();
  }
}
