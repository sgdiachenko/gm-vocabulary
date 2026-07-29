import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { WordParameterEnum } from '../../enums/word.parameter.enum';
import { WordsPreviewDialog, WordsPreviewDialogData } from './words-preview-dialog';

describe('WordsPreviewDialog', () => {
  let fixture: ComponentFixture<WordsPreviewDialog>;
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  const data: WordsPreviewDialogData = {
    words: [
      {
        [WordParameterEnum.ID]: '1',
        [WordParameterEnum.WORD]: 'hello',
        [WordParameterEnum.TRANSLATION]: 'привіт',
        [WordParameterEnum.DESCRIPTION]: 'A greeting',
        [WordParameterEnum.GROUP_ID]: 'group-1',
      },
      {
        [WordParameterEnum.ID]: '2',
        [WordParameterEnum.WORD]: 'goodbye',
        [WordParameterEnum.GROUP_ID]: 'group-1',
      },
    ],
  };

  beforeEach(() => {
    dialogRef = { close: vi.fn() };

    TestBed.configureTestingModule({
      imports: [WordsPreviewDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });

    fixture = TestBed.createComponent(WordsPreviewDialog);
  });

  it('shows only the name by default while keeping hidden content in the DOM', async () => {
    await fixture.whenStable();

    const fields = fixture.nativeElement.querySelectorAll('.word-field');
    const covers = fixture.nativeElement.querySelectorAll('.cover');

    expect(fields).toHaveLength(3);
    expect(covers[0].classList).not.toContain('cover_visible');
    expect(covers[1].classList).toContain('cover_visible');
    expect(covers[2].classList).toContain('cover_visible');
  });

  it('moves through the selected words and wraps around', async () => {
    await fixture.whenStable();
    const nextButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[aria-label="Show next word"]',
    );

    nextButton.click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.word-card').textContent).toContain('goodbye');

    nextButton.click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.word-card').textContent).toContain('hello');
  });

  it('closes the dialog', async () => {
    await fixture.whenStable();
    const closeButton = [...fixture.nativeElement.querySelectorAll('button')].find(
      (button: HTMLButtonElement) => button.textContent?.trim() === 'Close',
    );

    closeButton?.click();

    expect(dialogRef.close).toHaveBeenCalledOnce();
  });
});
