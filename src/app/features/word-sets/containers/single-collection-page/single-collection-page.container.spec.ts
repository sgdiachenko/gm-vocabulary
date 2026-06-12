import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { SingleCollectionPageContainer } from './single-collection-page.container';
import { AuthService } from '../../../auth/services/auth/auth.service';
import { WordsService } from '../../../words/services/words/words.service';
import { WordGroupService } from '../../services/word-group/word-group.service';

describe('SingleCollectionPageContainer', () => {
  let component: SingleCollectionPageContainer;
  let fixture: ComponentFixture<SingleCollectionPageContainer>;
  let mockAuthService: any;
  let mockWordsService: any;
  let mockWordGroupService: any;

  beforeEach(async () => {
    mockAuthService = {
      userId: signal('user123')
    };

    mockWordsService = {
      words: signal([]),
      addWords: () => {},
      resetStore: () => {}
    };

    mockWordGroupService = {
      groups: signal([{ _id: 'all', name: 'All Words', userId: 'user123' }]),
      getWordGroupOptions: signal([]),
      fetchIsLoading: signal(false),
      fetchError: signal(null),
      deleteIsLoading: signal(false),
      deleteError: signal(null),
      getGroup: () => of({ _id: 'all', name: 'All Words', words: [], userId: 'user123' }),
      resetStore: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [SingleCollectionPageContainer],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ collectionId: 'all' })
          }
        },
        { provide: AuthService, useValue: mockAuthService },
        { provide: WordsService, useValue: mockWordsService },
        { provide: WordGroupService, useValue: mockWordGroupService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleCollectionPageContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
