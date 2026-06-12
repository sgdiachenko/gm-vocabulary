import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { WordsTableService } from './words-table.service';

describe('WordsTableService', () => {
  let service: WordsTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WordsTableService],
    });
    service = TestBed.inject(WordsTableService);
  });

  it('should map words to table rows with group names', () => {
    const words = signal([
      { _id: '1', word: 'cat', translation: 'кіт', groupId: 'animals' },
      { _id: '2', word: 'tea', translation: 'чай', groupId: 'food' },
    ]);
    const groups = signal([
      { _id: 'animals', name: 'Animals' },
    ]);

    const tableData = service.getTableData(words, groups);

    expect(tableData()).toEqual([
      { _id: '1', word: 'cat', translation: 'кіт', groupId: 'animals', groupName: 'Animals' },
      { _id: '2', word: 'tea', translation: 'чай', groupId: 'food', groupName: undefined },
    ]);
  });
});
