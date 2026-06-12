import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { WordsPageContainer } from './words-page.container';
import { WordsService } from '../../services/words/words.service';
import { WordGroupService } from '../../../word-sets/services/word-group/word-group.service';
import { WordsTableService } from '../../services/words-table/words-table.service';

describe('WordsPageContainer', () => {
  let component: WordsPageContainer;
  let fixture: ComponentFixture<WordsPageContainer>;
  let mockWordsService: any;
  let mockWordGroupService: any;
  let mockWordsTableService: any;

  beforeEach(async () => {
    mockWordsService = {
      filteredWords: signal([]),
      fetchIsLoading: signal(false),
      fetchError: signal(null),
      deleteIsLoading: signal(false),
      deleteError: signal(null),
      getWords: () => of([]),
      resetStore: () => {}
    };

    mockWordGroupService = {
      groups: signal([]),
      getWordGroupOptions: signal([]),
      getUserGroups: () => of([]),
      resetStore: () => {}
    };

    mockWordsTableService = {
      getTableData: () => signal([])
    };

    await TestBed.configureTestingModule({
      imports: [WordsPageContainer],
      providers: [
        { provide: WordsService, useValue: mockWordsService },
        { provide: WordGroupService, useValue: mockWordGroupService },
        { provide: WordsTableService, useValue: mockWordsTableService },
        { provide: MatDialog, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordsPageContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
