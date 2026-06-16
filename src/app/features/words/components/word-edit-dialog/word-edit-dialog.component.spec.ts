import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WritableSignal, signal } from '@angular/core';
import { of } from 'rxjs';

import { WordEditDialogComponent } from './word-edit-dialog.component';
import { WordGroupParameterEnum } from '../../../word-sets/enums/word-group.parameter.enum';
import { WordsService } from '../../services/words/words.service';
import { WordGroupService } from '../../../word-sets/services/word-group/word-group.service';
import { WordParameterEnum } from '../../enums/word.parameter.enum';
import { WordEditDialogData } from './word-edit-dialog-data';
import { WordGroup } from '../../../word-sets/interfaces/word-group';

describe('WordEditDialogComponent', () => {
  let component: WordEditDialogComponent;
  let fixture: ComponentFixture<WordEditDialogComponent>;
  let dialogRef: { close: ReturnType<typeof vi.fn> };
  let dialogData: Partial<WordEditDialogData>;
  let groups: WritableSignal<WordGroup[]>;
  let mockWordsService: {
    updateIsLoading: WritableSignal<boolean>;
    updateError: WritableSignal<Error | null>;
    addWord: ReturnType<typeof vi.fn>;
    updateWord: ReturnType<typeof vi.fn>;
  };
  let mockWordGroupService: {
    groups: WritableSignal<WordGroup[]>;
    addGroup: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    dialogRef = { close: vi.fn() };
    dialogData = { wordGroups: [] };
    groups = signal<WordGroup[]>([]);
    mockWordsService = {
      updateIsLoading: signal(false),
      updateError: signal(null),
      addWord: vi.fn(() => of({})),
      updateWord: vi.fn(() => of({})),
    };

    mockWordGroupService = {
      groups,
      addGroup: vi.fn(() => of({})),
    };

    await TestBed.configureTestingModule({
      imports: [WordEditDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useFactory: () => dialogData },
        { provide: WordsService, useValue: mockWordsService },
        { provide: WordGroupService, useValue: mockWordGroupService }
      ]
    })
    .compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(WordEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponent();

    expect(component).toBeTruthy();
  });

  it('should initialize the signal form from dialog data', () => {
    dialogData = {
      [WordParameterEnum.ID]: 'word-id',
      [WordParameterEnum.WORD]: 'cat',
      [WordParameterEnum.TRANSLATION]: 'кіт',
      [WordParameterEnum.GROUP_ID]: 'animals',
      wordGroups: [{ id: 'animals', name: 'Animals' }],
    };

    createComponent();

    expect(component.wordForm[WordParameterEnum.WORD]().value()).toBe('cat');
    expect(component.wordForm[WordParameterEnum.TRANSLATION]().value()).toBe('кіт');
    expect(component.wordForm[WordParameterEnum.GROUP_ID]().value()).toBe('animals');
    expect(component.isWordFormValid()).toBe(true);
  });

  it('should require word and translation fields', () => {
    createComponent();

    expect(component.isWordFormValid()).toBe(false);
    expect(component.wordForm[WordParameterEnum.WORD]().getError('required')?.message).toBe('Word is required');
    expect(component.wordForm[WordParameterEnum.TRANSLATION]().getError('required')?.message).toBe(
      'Translation is required',
    );
  });

  it('should disable the group field when group selection is locked', () => {
    dialogData = {
      [WordParameterEnum.GROUP_ID]: 'animals',
      wordGroups: [{ id: 'animals', name: 'Animals' }],
      disableGroupSelection: true,
    };

    createComponent();

    expect(component.wordForm[WordParameterEnum.GROUP_ID]().disabled()).toBe(true);
  });

  it('should not submit when the signal form is invalid', () => {
    createComponent();

    component.apply();

    expect(mockWordGroupService.addGroup).not.toHaveBeenCalled();
    expect(mockWordsService.addWord).not.toHaveBeenCalled();
    expect(mockWordsService.updateWord).not.toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('should add a word with the selected existing group id', () => {
    groups.set([{ _id: 'animals', name: 'Animals' }]);
    createComponent();
    setFormValue({
      [WordParameterEnum.WORD]: 'cat',
      [WordParameterEnum.TRANSLATION]: 'кіт',
      [WordParameterEnum.GROUP_ID]: 'animals',
    });

    component.apply();

    expect(mockWordGroupService.addGroup).not.toHaveBeenCalled();
    expect(mockWordsService.addWord).toHaveBeenCalledWith({
      [WordParameterEnum.WORD]: 'cat',
      [WordParameterEnum.TRANSLATION]: 'кіт',
      [WordParameterEnum.GROUP_ID]: 'animals',
    });
    expect(dialogRef.close).toHaveBeenCalledOnce();
  });

  it('should create a custom group before adding a word', () => {
    mockWordGroupService.addGroup.mockReturnValue(of({
      [WordGroupParameterEnum.ID]: 'custom-group-id',
      [WordGroupParameterEnum.NAME]: 'New group',
    }));
    createComponent();
    setFormValue({
      [WordParameterEnum.WORD]: 'apple',
      [WordParameterEnum.TRANSLATION]: 'яблуко',
      [WordParameterEnum.GROUP_ID]: 'New group',
    });

    component.apply();

    expect(mockWordGroupService.addGroup).toHaveBeenCalledWith({
      [WordGroupParameterEnum.NAME]: 'New group',
    });
    expect(mockWordsService.addWord).toHaveBeenCalledWith({
      [WordParameterEnum.WORD]: 'apple',
      [WordParameterEnum.TRANSLATION]: 'яблуко',
      [WordParameterEnum.GROUP_ID]: 'custom-group-id',
    });
  });

  it('should update an existing word', () => {
    dialogData = {
      [WordParameterEnum.ID]: 'word-id',
      [WordParameterEnum.WORD]: 'cat',
      [WordParameterEnum.TRANSLATION]: 'кіт',
      [WordParameterEnum.GROUP_ID]: 'animals',
      wordGroups: [{ id: 'animals', name: 'Animals' }],
    };
    groups.set([{ _id: 'animals', name: 'Animals' }]);
    createComponent();
    component.wordForm[WordParameterEnum.TRANSLATION]().value.set('кішка');

    component.apply();

    expect(mockWordsService.updateWord).toHaveBeenCalledWith('word-id', {
      [WordParameterEnum.WORD]: 'cat',
      [WordParameterEnum.TRANSLATION]: 'кішка',
      [WordParameterEnum.GROUP_ID]: 'animals',
    });
    expect(mockWordsService.addWord).not.toHaveBeenCalled();
  });

  function setFormValue(value: {
    [WordParameterEnum.WORD]: string;
    [WordParameterEnum.TRANSLATION]: string;
    [WordParameterEnum.GROUP_ID]: string;
  }): void {
    component.wordForm[WordParameterEnum.WORD]().value.set(value[WordParameterEnum.WORD]);
    component.wordForm[WordParameterEnum.TRANSLATION]().value.set(value[WordParameterEnum.TRANSLATION]);
    component.wordForm[WordParameterEnum.GROUP_ID]().value.set(value[WordParameterEnum.GROUP_ID]);
  }
});
