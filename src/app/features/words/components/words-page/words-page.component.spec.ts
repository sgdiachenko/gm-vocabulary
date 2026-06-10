import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { WordsPageComponent } from './words-page.component';
import { WordsService } from '../../services/words.service';
import { WordGroupService } from '../../../word-sets/services/word-group.service';
import { WordsTableService } from '../../services/words-table.service';

describe('WordsPageComponent', () => {
  let component: WordsPageComponent;
  let fixture: ComponentFixture<WordsPageComponent>;
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
      imports: [WordsPageComponent],
      providers: [
        { provide: WordsService, useValue: mockWordsService },
        { provide: WordGroupService, useValue: mockWordGroupService },
        { provide: WordsTableService, useValue: mockWordsTableService },
        { provide: MatDialog, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordsPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
