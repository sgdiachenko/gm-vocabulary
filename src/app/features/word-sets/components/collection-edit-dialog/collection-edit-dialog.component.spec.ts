import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WritableSignal, signal } from '@angular/core';
import { of } from 'rxjs';

import { CollectionEditDialogComponent } from './collection-edit-dialog.component';
import { WordGroupParameterEnum } from '../../enums/word-group.parameter.enum';
import { WordGroupService } from '../../services/word-group/word-group.service';
import { WordGroupRequest } from '../../interfaces/word-group-request';
import { WordGroup } from '../../interfaces/word-group';
import { AppError } from '../../../../shared/types/app-error';

describe('CollectionEditDialogComponent', () => {
  let component: CollectionEditDialogComponent;
  let fixture: ComponentFixture<CollectionEditDialogComponent>;
  let dialogRef: { close: ReturnType<typeof vi.fn> };
  let dialogData: WordGroup | undefined;
  let updateIsLoading: WritableSignal<boolean>;
  let mockWordGroupService: {
    updateIsLoading: WritableSignal<boolean>;
    updateError: WritableSignal<AppError | null>;
    addGroup: ReturnType<typeof vi.fn>;
    updateGroup: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    dialogRef = { close: vi.fn() };
    dialogData = undefined;
    updateIsLoading = signal(false);
    mockWordGroupService = {
      updateIsLoading,
      updateError: signal(null),
      addGroup: vi.fn(() => of({})),
      updateGroup: vi.fn(() => of({}))
    };

    await TestBed.configureTestingModule({
      imports: [CollectionEditDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useFactory: () => dialogData },
        { provide: WordGroupService, useValue: mockWordGroupService }
      ]
    })
    .compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(CollectionEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponent();

    expect(component).toBeTruthy();
  });

  it('should use update loading state from the word group service', () => {
    updateIsLoading.set(true);

    createComponent();

    expect(component.updateIsLoading()).toBe(true);
  });

  it('should initialize the signal form from dialog data', () => {
    dialogData = {
      [WordGroupParameterEnum.ID]: 'group-id',
      [WordGroupParameterEnum.NAME]: 'Food',
      [WordGroupParameterEnum.IS_SHARED]: true,
    };

    createComponent();

    expect(component.wordGroupForm[WordGroupParameterEnum.NAME]().value()).toBe('Food');
    expect(component.wordGroupForm[WordGroupParameterEnum.IS_SHARED]().value()).toBe(true);
    expect(component.isWordGroupFormValid()).toBe(true);
  });

  it('should require the collection name field', () => {
    createComponent();

    expect(component.isWordGroupFormValid()).toBe(false);
    expect(component.wordGroupForm[WordGroupParameterEnum.NAME]().getError('required')?.message).toBe(
      'Name is required',
    );
  });

  it('should not submit when the signal form is invalid', () => {
    createComponent();

    component.apply();

    expect(mockWordGroupService.addGroup).not.toHaveBeenCalled();
    expect(mockWordGroupService.updateGroup).not.toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('should add a collection from the signal form model', () => {
    createComponent();
    setFormValue({
      [WordGroupParameterEnum.NAME]: 'Food',
      [WordGroupParameterEnum.IS_SHARED]: true,
    });

    component.apply();

    expect(mockWordGroupService.addGroup).toHaveBeenCalledWith({
      [WordGroupParameterEnum.NAME]: 'Food',
      [WordGroupParameterEnum.IS_SHARED]: true,
    });
    expect(mockWordGroupService.updateGroup).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledOnce();
  });

  it('should update an existing collection from the signal form model', () => {
    dialogData = {
      [WordGroupParameterEnum.ID]: 'group-id',
      [WordGroupParameterEnum.NAME]: 'Food',
      [WordGroupParameterEnum.IS_SHARED]: false,
    };
    createComponent();
    setFormValue({
      [WordGroupParameterEnum.NAME]: 'Meals',
      [WordGroupParameterEnum.IS_SHARED]: true,
    });

    component.apply();

    expect(mockWordGroupService.updateGroup).toHaveBeenCalledWith('group-id', {
      [WordGroupParameterEnum.NAME]: 'Meals',
      [WordGroupParameterEnum.IS_SHARED]: true,
    });
    expect(mockWordGroupService.addGroup).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledOnce();
  });

  function setFormValue(value: WordGroupRequest): void {
    component.wordGroupForm[WordGroupParameterEnum.NAME]().value.set(value[WordGroupParameterEnum.NAME]);
    component.wordGroupForm[WordGroupParameterEnum.IS_SHARED]().value.set(
      value[WordGroupParameterEnum.IS_SHARED] ?? false,
    );
  }
});
