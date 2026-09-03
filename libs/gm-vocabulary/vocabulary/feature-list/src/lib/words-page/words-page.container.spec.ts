import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { WordsPageContainer } from './words-page.container';
import { WordsService } from '@gm-vocabulary/vocabulary/data-access';
import { WordGroupService } from '@gm-vocabulary/collections/data-access';
import { WordsTableService } from '@gm-vocabulary/vocabulary/ui';

describe('WordsPageContainer', () => {
  let component: WordsPageContainer;
  let fixture: ComponentFixture<WordsPageContainer>;

  beforeEach(async () => {
    const mockWordsService = {
      filteredWords: signal([]),
      fetchIsLoading: signal(false),
      fetchError: signal(null),
      deleteIsLoading: signal(false),
      deleteError: signal(null),
      getWords: () => of([]),
      resetStore: vi.fn(),
    };

    const mockWordGroupService = {
      groups: signal([]),
      getWordGroupOptions: signal([]),
      getUserGroups: () => of([]),
      resetStore: vi.fn(),
    };

    const mockWordsTableService = {
      getTableData: () => signal([]),
    };

    await TestBed.configureTestingModule({
      imports: [WordsPageContainer],
      providers: [
        { provide: WordsService, useValue: mockWordsService },
        { provide: WordGroupService, useValue: mockWordGroupService },
        { provide: WordsTableService, useValue: mockWordsTableService },
        { provide: MatDialog, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WordsPageContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
