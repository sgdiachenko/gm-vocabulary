import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

import { SnackBar } from './snack-bar';

describe('SnackBar', () => {
  let component: SnackBar;
  let fixture: ComponentFixture<SnackBar>;
  const snackBarRef = { dismiss: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnackBar],
      providers: [
        {
          provide: MAT_SNACK_BAR_DATA,
          useValue: { type: 'success', message: 'Account created' },
        },
        { provide: MatSnackBarRef, useValue: snackBarRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SnackBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render messages and styles for the provided type', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Account created');
    expect(element.querySelector('p')?.textContent).toContain('Account created');
    expect(element.querySelector('li')).toBeNull();
    expect(element.querySelector('[role="status"]')?.classList).toContain('bg-emerald-50');
  });

  it('should dismiss when the close button is clicked', () => {
    snackBarRef.dismiss.mockClear();
    fixture.nativeElement.querySelector('button').click();
    expect(snackBarRef.dismiss).toHaveBeenCalledOnce();
  });
});
