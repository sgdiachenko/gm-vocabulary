import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { CollectionEditDialogComponent } from './collection-edit-dialog.component';
import { WordGroupService } from '../../services/word-group/word-group.service';

describe('CollectionEditDialogComponent', () => {
  let component: CollectionEditDialogComponent;
  let fixture: ComponentFixture<CollectionEditDialogComponent>;
  let mockWordGroupService: any;

  beforeEach(async () => {
    mockWordGroupService = {
      deleteIsLoading: signal(false),
      updateError: signal(null),
      addGroup: () => of({}),
      updateGroup: () => of({})
    };

    await TestBed.configureTestingModule({
      imports: [CollectionEditDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: WordGroupService, useValue: mockWordGroupService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionEditDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
