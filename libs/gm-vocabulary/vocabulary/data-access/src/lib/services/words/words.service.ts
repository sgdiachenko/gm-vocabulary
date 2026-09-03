import { inject, Service, signal, Signal, WritableSignal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { WordParameterEnum } from '@gm-vocabulary/vocabulary/util';
import { AppError } from '@gm-vocabulary/shared/util';

import { WordRequest } from '@gm-vocabulary/vocabulary/util';
import { WordsApiService } from '../words-api/words-api.service';
import { WordsStore } from '../../store/words/words.store';
import { Word } from '@gm-vocabulary/vocabulary/util';

@Service()
export class WordsService {
  private readonly wordsApiService = inject(WordsApiService);
  private readonly wordsStore = inject(WordsStore);

  readonly words: Signal<Word[]> = this.wordsStore.words;
  readonly filteredWords: Signal<Word[]> = this.wordsStore.filteredWords;
  readonly selectedGroupId: Signal<string> = this.wordsStore.groupId;

  fetchIsLoading: WritableSignal<boolean> = signal(false);
  fetchError: WritableSignal<AppError | null> = signal(null);

  updateIsLoading: WritableSignal<boolean> = signal(false);
  updateError: WritableSignal<AppError | null> = signal(null);

  deleteIsLoading: WritableSignal<boolean> = signal(false);
  deleteError: WritableSignal<AppError | null> = signal(null);

  getWords(): Observable<Word[]> {
    const updateRequestState = (error: AppError | null, isLoading: boolean): void => {
      this.fetchError.set(error);
      this.fetchIsLoading.set(isLoading);
    };

    return this.wordsApiService.getWords().pipe(
      tap((result) => {
        this.addWords(result);
        updateRequestState(null, false);
      }),
      catchError((err: HttpErrorResponse) => {
        updateRequestState(err, false);
        return throwError(err);
      }),
    );
  }

  addWord(word: WordRequest): Observable<Word> {
    this.updateRequestState(null, true);
    return this.wordsApiService.addWord(word).pipe(
      tap((result: Word) => {
        this.wordsStore.addWord(result);
        this.updateRequestState(null, false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.updateRequestState(err, false);
        return throwError(err);
      }),
    );
  }

  copyWords(ids: string[]): Observable<Word[]> {
    this.updateRequestState(null, true);
    return this.wordsApiService.copyWords(ids).pipe(
      tap(() => {
        this.updateRequestState(null, false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.updateRequestState(err, false);
        return throwError(() => err);
      }),
    );
  }

  updateWord(id: string, word: WordRequest): Observable<void> {
    this.updateRequestState(null, true);
    return this.wordsApiService.updateWord(id, word).pipe(
      tap(() => {
        this.wordsStore.updateWord({
          ...word,
          [WordParameterEnum.ID]: id,
        });
        this.updateRequestState(null, false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.updateRequestState(err, false);
        return throwError(err);
      }),
    );
  }

  deleteWords(ids: string[]): Observable<void> {
    const updateRequestState = (error: AppError | null, isLoading: boolean): void => {
      this.deleteError.set(error);
      this.deleteIsLoading.set(isLoading);
    };

    updateRequestState(null, true);
    return this.wordsApiService.deleteWords(ids).pipe(
      tap(() => {
        this.wordsStore.deleteWords(ids);
        updateRequestState(null, false);
      }),
      catchError((err: HttpErrorResponse) => {
        updateRequestState(err, false);
        return throwError(err);
      }),
    );
  }

  filterByGroupId = this.wordsStore.filterByGroupId;
  resetStore = this.wordsStore.resetStore;
  addWords = this.wordsStore.addWords;

  private updateRequestState(error: AppError | null, isLoading: boolean): void {
    this.updateError.set(error);
    this.updateIsLoading.set(isLoading);
  }
}
