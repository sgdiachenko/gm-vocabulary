import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { CollectionsPageComponent } from './collections-page.component';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { WordGroupService } from '../../services/word-group.service';

describe('CollectionsPageComponent', () => {
  let component: CollectionsPageComponent;
  let fixture: ComponentFixture<CollectionsPageComponent>;
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
      imports: [CollectionsPageComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: WordGroupService, useValue: mockWordGroupService },
        { provide: MatDialog, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionsPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
