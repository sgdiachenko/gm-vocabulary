import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { WordRequest } from '../../interfaces/word-request';
import { Word } from '../../interfaces/word';


@Service()
export class WordsApiService {

  private http = inject(HttpClient);

  private BASE_URL = `${environment.vocabularyApiUrl}/words`;

  getWords(): Observable<Word[]> {
    return this.http.get<Word[]>(this.BASE_URL);
  }

  addWord(word: WordRequest): Observable<Word> {
    return this.http.post<Word>(this.BASE_URL, word);
  }

  updateWord(id: string, word: WordRequest): Observable<void> {
    return this.http.put<void>(`${this.BASE_URL}/${id}`, word);
  }

  deleteWords(ids: string[]): Observable<void> {
    return this.http.delete<void>(this.BASE_URL, {
      body: { ids }
    });
  }
}
