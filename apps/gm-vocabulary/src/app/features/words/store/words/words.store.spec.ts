import { TestBed } from '@angular/core/testing';

import { DefaultOptionValueEnum } from '../../../../shared/enums/default-option-value.enum';
import { WordParameterEnum } from '../../enums/word.parameter.enum';
import { WordsStore, initialState } from './words.store';
import { Word } from '../../interfaces/word';

describe('WordsStore', () => {
  let store: InstanceType<typeof WordsStore>;
  const words: Word[] = [
    { _id: '1', word: 'cat', translation: 'кіт', groupId: 'animals' },
    { _id: '2', word: 'tea', translation: 'чай', groupId: 'food' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(WordsStore);
    store.resetStore();
  });

  it('should expose initial state', () => {
    expect(store.words()).toEqual(initialState.words);
    expect(store.groupId()).toBe(DefaultOptionValueEnum.ALL);
    expect(store.queryString()).toBe('');
  });

  it('should add, update, and delete words', () => {
    store.addWords(words);
    store.updateWord({ ...words[0], [WordParameterEnum.TRANSLATION]: 'кішка' });
    store.deleteWords(['2']);

    expect(store.words()).toEqual([
      { _id: '1', word: 'cat', translation: 'кішка', groupId: 'animals' },
    ]);
  });

  it('should filter words by group id', () => {
    store.addWords(words);

    store.filterByGroupId('animals');

    expect(store.filteredWords()).toEqual([words[0]]);
  });

  it('should reset store state', () => {
    store.addWords(words);
    store.filterByGroupId('animals');

    store.resetStore();

    expect(store.words()).toEqual(initialState.words);
    expect(store.groupId()).toBe(initialState.groupId);
    expect(store.filteredWords()).toEqual([]);
  });
});
