import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  Signal,
  WritableSignal,
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

import { DataLoadingWrapperComponent } from '@gm-vocabulary/shared/ui';
import { SubmitDialogComponent } from '@gm-vocabulary/shared/ui';
import { CollectionEditDialogComponent } from '@gm-vocabulary/collections/feature-editor';
import { SubmitDialogData } from '@gm-vocabulary/shared/ui';
import { WordGroupService } from '@gm-vocabulary/collections/data-access';
import { WordGroup } from '@gm-vocabulary/collections/util';
import { AuthService } from '@gm-vocabulary/auth/data-access';
import { getErrorSnackBarData } from '@gm-vocabulary/shared/ui';
import { SnackBarData } from '@gm-vocabulary/shared/ui';

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
  templateUrl: './collections-page.container.html',
  styleUrl: './collections-page.container.scss',
})
export class CollectionsPageContainer implements OnInit, OnDestroy {
  private readonly authService: AuthService = inject(AuthService);
  private readonly wordGroupService: WordGroupService = inject(WordGroupService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly dialog: MatDialog = inject(MatDialog);

  readonly collections: Signal<WordGroup[]> = this.wordGroupService.groups;
  readonly sharedCollections: Signal<WordGroup[]> = this.wordGroupService.sharedGroups;
  readonly userId: Signal<string | null> = this.authService.userId;

  readonly fetchIsLoading: Signal<boolean> = this.wordGroupService.fetchIsLoading;
  readonly deleteIsLoading: WritableSignal<boolean> = this.wordGroupService.deleteIsLoading;
  readonly snackBarData: Signal<SnackBarData | null> = computed(() =>
    getErrorSnackBarData(this.wordGroupService.fetchError() || this.wordGroupService.deleteError()),
  );

  private editDialogRef?: MatDialogRef<CollectionEditDialogComponent>;
  private deleteDialogRef?: MatDialogRef<SubmitDialogComponent>;

  ngOnInit(): void {
    forkJoin([this.wordGroupService.getUserGroups(), this.wordGroupService.getSharedGroups()])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  openEditDialog(wordGroup?: WordGroup) {
    this.editDialogRef = this.dialog.open<CollectionEditDialogComponent, WordGroup | undefined>(
      CollectionEditDialogComponent,
      {
        data: wordGroup,
      },
    );
  }

  openDeleteDialog(wordGroupId: string) {
    this.deleteDialogRef = this.dialog.open<SubmitDialogComponent, SubmitDialogData>(
      SubmitDialogComponent,
      {
        data: {
          title: 'Delete',
          text: 'Are you sure you want to delete selected collection?',
        },
      },
    );

    this.deleteDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.wordGroupService
          .deleteGroup(wordGroupId)
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
