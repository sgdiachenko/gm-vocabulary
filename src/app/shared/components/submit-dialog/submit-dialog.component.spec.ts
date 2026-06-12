import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { SubmitDialogComponent } from './submit-dialog.component';

describe('SubmitDialogComponent', () => {
  let component: SubmitDialogComponent;
  let fixture: ComponentFixture<SubmitDialogComponent>;
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [SubmitDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'Delete item',
            text: 'Are you sure?'
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render dialog title and text', async () => {
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('[mat-dialog-title]').textContent.trim()).toBe('Delete item');
    expect(fixture.nativeElement.querySelector('mat-dialog-content').textContent.trim()).toBe('Are you sure?');
  });

  it('should close without submit value when cancel is clicked', async () => {
    await fixture.whenStable();

    getButton('Cancel').click();

    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });

  it('should close with submit value when submit is clicked', async () => {
    await fixture.whenStable();

    getButton('Submit').click();

    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close with the provided value from close method', () => {
    component.close(false);

    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  function getButton(text: string): HTMLButtonElement {
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;

    return Array.from(buttons)
      .find((button) => button.textContent.trim() === text) as HTMLButtonElement;
  }
});
