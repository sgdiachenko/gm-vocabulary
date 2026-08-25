import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component } from '@angular/core';

import { DataLoadingWrapperComponent } from './data-loading-wrapper.component';
import { SnackBar } from '../snack-bar/snack-bar';

@Component({
  imports: [DataLoadingWrapperComponent],
  template: `
    <gm-data-loading-wrapper>
      <span class="projected-content">Content</span>
    </gm-data-loading-wrapper>
  `
})
class TestHostComponent {}

describe('DataLoadingWrapperComponent', () => {
  let component: DataLoadingWrapperComponent;
  let fixture: ComponentFixture<DataLoadingWrapperComponent>;
  let snackBar: {
    dismiss: ReturnType<typeof vi.fn>;
    openFromComponent: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    snackBar = {
      dismiss: vi.fn(),
      openFromComponent: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DataLoadingWrapperComponent, TestHostComponent],
      providers: [
        { provide: MatSnackBar, useValue: snackBar }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataLoadingWrapperComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should project content when not loading', async () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    await hostFixture.whenStable();

    expect(hostFixture.nativeElement.querySelector('.projected-content')?.textContent).toBe('Content');
    expect(hostFixture.nativeElement.querySelector('gm-spinner')).toBeNull();
  });

  it('should render spinner when loading', async () => {
    fixture.componentRef.setInput('loadingState', true);
    await fixture.whenStable();

    expect(getSpinner()).toBeTruthy();
  });

  it('should open the custom snackbar with the provided data', async () => {
    const data = { type: 'error' as const, message: 'Something failed' };
    fixture.componentRef.setInput('snackBarData', data);
    await fixture.whenStable();

    expect(snackBar.openFromComponent).toHaveBeenCalledWith(SnackBar, {
      data,
      panelClass: 'gm-snack-bar-panel',
    });
  });

  it('should dismiss snackbar when data is cleared', async () => {
    fixture.componentRef.setInput('snackBarData', {
      type: 'success',
      message: 'Saved successfully',
    });
    await fixture.whenStable();
    snackBar.dismiss.mockClear();

    fixture.componentRef.setInput('snackBarData', null);
    await fixture.whenStable();

    expect(snackBar.dismiss).toHaveBeenCalledOnce();
  });

  function getSpinner(): HTMLElement | null {
    return fixture.nativeElement.querySelector('gm-spinner');
  }
});
