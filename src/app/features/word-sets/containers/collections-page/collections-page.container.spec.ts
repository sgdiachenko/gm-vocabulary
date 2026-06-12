import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { CollectionsPageContainer } from './collections-page.container';
import { AuthService } from '../../../../features/auth/services/auth/auth.service';
import { WordGroupService } from '../../services/word-group/word-group.service';

describe('CollectionsPageContainer', () => {
  let component: CollectionsPageContainer;
  let fixture: ComponentFixture<CollectionsPageContainer>;
  let mockAuthService: any;
  let mockWordGroupService: any;

  beforeEach(async () => {
    mockAuthService = {
      userId: signal('user123')
    };

    mockWordGroupService = {
      groups: signal([]),
      sharedGroups: signal([]),
      fetchIsLoading: signal(false),
      fetchError: signal(null),
      deleteIsLoading: signal(false),
      deleteError: signal(null),
      getUserGroups: () => of([]),
      getSharedGroups: () => of([]),
      resetStore: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [CollectionsPageContainer],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: WordGroupService, useValue: mockWordGroupService },
        { provide: MatDialog, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionsPageContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
