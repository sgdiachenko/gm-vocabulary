import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { WordEditDialogComponent } from './word-edit-dialog.component';
import { WordsService } from '../../services/words/words.service';
import { WordGroupService } from '../../../word-sets/services/word-group/word-group.service';

describe('WordEditDialogComponent', () => {
  let component: WordEditDialogComponent;
  let fixture: ComponentFixture<WordEditDialogComponent>;
  let mockWordsService: any;
  let mockWordGroupService: any;

  beforeEach(async () => {
    mockWordsService = {
      updateIsLoading: signal(false),
      updateError: signal(null),
      addWord: () => of({}),
      updateWord: () => of({})
    };

    mockWordGroupService = {
      groups: signal([]),
      addGroup: () => of({})
    };

    await TestBed.configureTestingModule({
      imports: [WordEditDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: WordsService, useValue: mockWordsService },
        { provide: WordGroupService, useValue: mockWordGroupService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordEditDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
