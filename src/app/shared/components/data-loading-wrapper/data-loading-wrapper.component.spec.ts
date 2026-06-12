import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DataLoadingWrapperComponent } from './data-loading-wrapper.component';

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
    open: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    snackBar = {
      dismiss: vi.fn(),
      open: vi.fn()
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

  it('should show error message when error changes', async () => {
    const error = new Error('Something failed');

    fixture.componentRef.setInput('error', error);
    await fixture.whenStable();

    expect(snackBar.open).toHaveBeenCalledWith('Something failed', 'Close');
  });

  it('should dismiss snackbar when error is cleared', async () => {
    fixture.componentRef.setInput('error', new Error('Something failed'));
    await fixture.whenStable();
    snackBar.dismiss.mockClear();

    fixture.componentRef.setInput('error', null);
    await fixture.whenStable();

    expect(snackBar.dismiss).toHaveBeenCalledOnce();
  });

  it('should show success message when success message changes', async () => {
    fixture.componentRef.setInput('successMessage', 'Saved successfully');
    await fixture.whenStable();

    expect(snackBar.open).toHaveBeenCalledWith('Saved successfully', 'Close');
  });

  it('should dismiss snackbar when success message is cleared', async () => {
    fixture.componentRef.setInput('successMessage', 'Saved successfully');
    await fixture.whenStable();
    snackBar.dismiss.mockClear();

    fixture.componentRef.setInput('successMessage', null);
    await fixture.whenStable();

    expect(snackBar.dismiss).toHaveBeenCalledOnce();
  });

  function getSpinner(): HTMLElement | null {
    return fixture.nativeElement.querySelector('gm-spinner');
  }
});
