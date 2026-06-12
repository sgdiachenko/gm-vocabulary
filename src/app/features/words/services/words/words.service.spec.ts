import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';

import { WordParameterEnum } from '../../enums/word.parameter.enum';
import { WordsApiService } from '../words-api/words-api.service';
import { WordsService } from './words.service';
import { WordsStore } from '../../store/words/words.store';
import { Word } from '../../interfaces/word';

describe('WordsService', () => {
  let service: WordsService;
  let store: InstanceType<typeof WordsStore>;
  let mockWordsApiService: {
    getWords: ReturnType<typeof vi.fn>;
    addWord: ReturnType<typeof vi.fn>;
    updateWord: ReturnType<typeof vi.fn>;
    deleteWords: ReturnType<typeof vi.fn>;
  };

  const words: Word[] = [
    { _id: '1', word: 'cat', translation: 'кіт', groupId: 'animals' },
    { _id: '2', word: 'tea', translation: 'чай', groupId: 'food' },
  ];

  beforeEach(() => {
    mockWordsApiService = {
      getWords: vi.fn(),
      addWord: vi.fn(),
      updateWord: vi.fn(),
      deleteWords: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        WordsService,
        { provide: WordsApiService, useValue: mockWordsApiService },
      ],
    });

    service = TestBed.inject(WordsService);
    store = TestBed.inject(WordsStore);
    store.resetStore();
  });

  it('should fetch words and add them to the store', async () => {
    mockWordsApiService.getWords.mockReturnValue(of(words));

    const result = await firstValueFrom(service.getWords());

    expect(result).toEqual(words);
    expect(service.words()).toEqual(words);
    expect(service.fetchIsLoading()).toBe(false);
    expect(service.fetchError()).toBeNull();
  });

  it('should add a word and update loading state', async () => {
    mockWordsApiService.addWord.mockReturnValue(of(words[0]));

    const result = await firstValueFrom(service.addWord({
      word: 'cat',
      translation: 'кіт',
      groupId: 'animals',
    }));

    expect(result).toEqual(words[0]);
    expect(service.words()).toEqual([words[0]]);
    expect(service.updateIsLoading()).toBe(false);
    expect(service.updateError()).toBeNull();
  });

  it('should update a word in the store', async () => {
    store.addWords(words);
    mockWordsApiService.updateWord.mockReturnValue(of(void 0));

    await firstValueFrom(service.updateWord('1', {
      word: 'cat',
      translation: 'кішка',
      groupId: 'animals',
    }));

    expect(service.words()[0][WordParameterEnum.TRANSLATION]).toBe('кішка');
    expect(service.updateIsLoading()).toBe(false);
  });

  it('should delete words from the store', async () => {
    store.addWords(words);
    mockWordsApiService.deleteWords.mockReturnValue(of(void 0));

    await firstValueFrom(service.deleteWords(['1']));

    expect(service.words()).toEqual([words[1]]);
    expect(service.deleteIsLoading()).toBe(false);
    expect(service.deleteError()).toBeNull();
  });

  it('should expose request errors', async () => {
    const error = { error: { message: 'Could not add word' } };
    mockWordsApiService.addWord.mockReturnValue(throwError(() => error));

    await expect(firstValueFrom(service.addWord({
      word: 'cat',
      translation: 'кіт',
      groupId: 'animals',
    }))).rejects.toBe(error);

    expect(service.updateIsLoading()).toBe(false);
    expect(service.updateError()?.message).toBe('Could not add word');
  });
});
