import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../../environments/environment';
import { WordsApiService } from './words-api.service';

describe('WordsApiService', () => {
  let service: WordsApiService;
  let httpTestingController: HttpTestingController;
  const baseUrl = `${environment.vocabularyApiUrl}/words`;
  const word = {
    _id: '1',
    word: 'cat',
    translation: 'кіт',
    groupId: 'animals',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WordsApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(WordsApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should get words', () => {
    service.getWords().subscribe(response => {
      expect(response).toEqual([word]);
    });

    const req = httpTestingController.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');

    req.flush([word]);
  });

  it('should add a word', () => {
    const request = {
      word: 'cat',
      translation: 'кіт',
      groupId: 'animals',
    };

    service.addWord(request).subscribe(response => {
      expect(response).toEqual(word);
    });

    const req = httpTestingController.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);

    req.flush(word);
  });

  it('should update a word', () => {
    const request = {
      word: 'cat',
      translation: 'кішка',
      groupId: 'animals',
    };

    service.updateWord('1', request).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpTestingController.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);

    req.flush(null);
  });

  it('should delete words with ids in the request body', () => {
    service.deleteWords(['1', '2']).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpTestingController.expectOne(baseUrl);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual({ ids: ['1', '2'] });

    req.flush(null);
  });
});
