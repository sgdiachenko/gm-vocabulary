import { computed, inject, Service, signal, Signal, WritableSignal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';

import { WordGroupParameterEnum } from '../../enums/word-group.parameter.enum';
import { SelectOption } from '../../../../shared/interfaces/select-option';
import { WordGroupRequest } from '../../interfaces/word-group-request';
import { WordGroupsApiService } from '../word-groups-api/word-groups-api.service';
import { WordGroupsStore } from '../../store/word-groups/word-groups.store';
import { WordGroup } from '../../interfaces/word-group';

@Service()
export class WordGroupService {
  private wordsApiService = inject(WordGroupsApiService);
  private wordGroupsStore = inject(WordGroupsStore);

  readonly groups: Signal<WordGroup[]> = this.wordGroupsStore.groups;
  readonly sharedGroups: Signal<WordGroup[]> = this.wordGroupsStore.sharedGroups;

  fetchIsLoading: WritableSignal<boolean> = signal(false);
  fetchError: WritableSignal<Error> = signal(null);

  updateIsLoading: WritableSignal<boolean> = signal(false);
  updateError: WritableSignal<Error> = signal(null);

  deleteIsLoading: WritableSignal<boolean> = signal(false);
  deleteError: WritableSignal<Error> = signal(null);

  getUserGroups(): Observable<WordGroup[]> {
    const updateRequestState = (error: Error, isLoading: boolean): void => {
      this.fetchError.set(error);
      this.fetchIsLoading.set(isLoading);
    }

    updateRequestState(null, true);
    return this.wordsApiService.getUserGroups().pipe(
      tap(groups => {
        this.wordGroupsStore.addGroups(groups);
        updateRequestState(null, false)
      }),
      catchError(err => {
        updateRequestState(new Error(err.error?.message ?? err.message), false)
        return throwError(() => err);
      })
    );
  }

  getSharedGroups(): Observable<WordGroup[]> {
    const updateRequestState = (error: Error, isLoading: boolean): void => {
      this.fetchError.set(error);
      this.fetchIsLoading.set(isLoading);
    }

    updateRequestState(null, true);
    return this.wordsApiService.getSharedGroups().pipe(
      tap(groups => {
        this.wordGroupsStore.addSharedGroups(groups);
        updateRequestState(null, false)
      }),
      catchError(err => {
        updateRequestState(new Error(err.error?.message ?? err.message), false)
        return throwError(() => err);
      })
    );
  }

  getGroup(id: string): Observable<WordGroup> {
    const updateRequestState = (error: Error, isLoading: boolean): void => {
      this.fetchError.set(error);
      this.fetchIsLoading.set(isLoading);
    }

    updateRequestState(null, true);
    return this.wordsApiService.getGroup(id).pipe(
      tap(group => {
        this.wordGroupsStore.addGroup(group);
        updateRequestState(null, false)
      }),
      catchError(err => {
        updateRequestState(new Error(err.error?.message ?? err.message), false)
        return throwError(() => err);
      })
    );
  }

  addGroup(word: WordGroupRequest): Observable<WordGroup> {
    this.updateRequestState(null, true);
    return this.wordsApiService.addGroup(word).pipe(
      tap(response => {
        this.wordGroupsStore.addGroup(response);
        this.updateRequestState(null, false)
      }),
      catchError(err => {
        this.updateRequestState(new Error(err.error?.message ?? err.message), false)
        return throwError(() => err);
      })
    );
  }

  addGroupSet(groups: WordGroupRequest[]): Observable<WordGroup[]> {
    this.updateRequestState(null, true);
    return this.wordsApiService.addGroupSet(groups).pipe(
      tap(response => {
        this.wordGroupsStore.addGroups(response);
        this.updateRequestState(null, false)
      }),
      catchError(err => {
        this.updateRequestState(new Error(err.error?.message ?? err.message), false)
        return throwError(() => err);
      })
    );
  }

  updateGroup(id: string, group: WordGroupRequest): Observable<void> {
    this.updateRequestState(null, true);
    return this.wordsApiService.updateGroup(id, group).pipe(
      tap(() => {
        this.wordGroupsStore.updateGroup({
          ...group,
          [WordGroupParameterEnum.ID]: id
        });
        this.updateRequestState(null, false)
      }),
      catchError(err => {
        this.updateRequestState(new Error(err.error?.message ?? err.message), false)
        return throwError(err);
      })
    );
  }

  deleteGroup(id: string): Observable<void> {
    const updateRequestState = (error: Error, isLoading: boolean): void => {
      this.deleteError.set(error);
      this.deleteIsLoading.set(isLoading);
    }

    updateRequestState(null, true);
    return this.wordsApiService.deleteGroup(id).pipe(
      tap(() => {
        this.wordGroupsStore.deleteGroup(id);
        updateRequestState(null, false)
      }),
      catchError(err => {
        updateRequestState(new Error(err.error?.message ?? err.message), false);
        return throwError(err);
      })
    );
  }

  getGroupNameById(id: Signal<string>): Signal<string> {
    return computed(() => {
      return this.groups()?.find(group => group[WordGroupParameterEnum.ID] === id())?.[WordGroupParameterEnum.NAME];
    });
  }

  getWordGroupOptions: Signal<SelectOption[]> = computed(() => {
    return this.groups().map((group) => {
      return {
        id: group[WordGroupParameterEnum.ID],
        name: group[WordGroupParameterEnum.NAME]
      }
    })
  });

  resetStore = this.wordGroupsStore.resetStore;

  private updateRequestState(error: Error, isLoading: boolean): void {
    this.updateError.set(error);
    this.updateIsLoading.set(isLoading);
  }
}
