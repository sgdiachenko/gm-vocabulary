import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { WordGroupRequest } from '../../interfaces/word-group-request';
import { environment } from '../../../../../environments/environment';
import { WordGroup } from '../../interfaces/word-group';

@Service()
export class WordGroupsApiService {
  private readonly http = inject(HttpClient);

  private readonly BASE_URL = `${environment.vocabularyApiUrl}/collections`;

  getUserGroups(): Observable<WordGroup[]> {
    return this.http.get<WordGroup[]>(this.BASE_URL);
  }

  getSharedGroups(): Observable<WordGroup[]> {
    return this.http.get<WordGroup[]>(`${this.BASE_URL}/shared`);
  }

  getGroup(id: string): Observable<WordGroup> {
    return this.http.get<WordGroup>(`${this.BASE_URL}/${id}`);
  }

  addGroup(group: WordGroupRequest): Observable<WordGroup> {
    return this.http.post<WordGroup>(this.BASE_URL, group);
  }

  addGroupSet(group: WordGroupRequest[]): Observable<WordGroup[]> {
    return this.http.post<WordGroup[]>(`${this.BASE_URL}/bulk`, group);
  }

  updateGroup(id: string, group: WordGroupRequest): Observable<void> {
    return this.http.put<void>(`${this.BASE_URL}/${id}`, group);
  }

  deleteGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/${id}`);
  }
}
