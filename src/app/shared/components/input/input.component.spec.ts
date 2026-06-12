import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';

import { InputComponent } from './input.component';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;
  let ngControl: { valueAccessor: unknown };

  beforeEach(async () => {
    ngControl = { valueAccessor: null };

    await TestBed.configureTestingModule({
      imports: [InputComponent],
    })
    .overrideComponent(InputComponent, {
      add: {
        providers: [
          { provide: NgControl, useValue: ngControl },
        ],
      },
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register itself as the control value accessor', () => {
    expect(ngControl.valueAccessor).toBe(component);
  });

  it('should render label, field type, and generated placeholder', async () => {
    fixture.componentRef.setInput('fieldLabel', 'Email');
    fixture.componentRef.setInput('fieldType', 'email');
    await fixture.whenStable();

    expect(getLabelText()).toContain('Email');
    expect(getInput().type).toBe('email');
    expect(getInput().placeholder).toBe('Enter email');
  });

  it('should render explicit placeholder when provided', async () => {
    fixture.componentRef.setInput('fieldLabel', 'Password');
    fixture.componentRef.setInput('fieldPlaceholder', 'Use a strong password');
    await fixture.whenStable();

    expect(getInput().placeholder).toBe('Use a strong password');
  });

  it('should render field errors', async () => {
    fixture.componentRef.setInput('fieldErrors', ['This field is required', 'Email is not valid']);
    await fixture.whenStable();

    expect(getErrorTexts()).toEqual(['This field is required', 'Email is not valid']);
  });

  it('should hide errors when there are no field errors', async () => {
    fixture.componentRef.setInput('fieldErrors', ['This field is required']);
    await fixture.whenStable();

    fixture.componentRef.setInput('fieldErrors', []);
    await fixture.whenStable();

    expect(getErrorTexts()).toEqual([]);
  });

  it('should write values without notifying registered change handlers', async () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);

    component.writeValue('Initial value');
    await fixture.whenStable();

    expect(component.inputControl.value).toBe('Initial value');
    expect(getInput().value).toBe('Initial value');
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('should write an empty string when the incoming value is null', async () => {
    component.writeValue('Initial value');
    await fixture.whenStable();

    component.writeValue(null);
    await fixture.whenStable();

    expect(component.inputControl.value).toBe('');
    expect(getInput().value).toBe('');
  });

  it('should notify registered change handlers when the input control changes', () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);

    component.inputControl.setValue('Typed value');

    expect(onChangeSpy).toHaveBeenCalledWith('Typed value');
  });

  it('should toggle disabled state without notifying registered change handlers', () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);

    component.setDisabledState(true);

    expect(component.inputControl.disabled).toBe(true);
    expect(onChangeSpy).not.toHaveBeenCalled();

    component.setDisabledState(false);

    expect(component.inputControl.enabled).toBe(true);
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  function getInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input');
  }

  function getLabelText(): string {
    return fixture.nativeElement.querySelector('mat-label')?.textContent?.trim() ?? '';
  }

  function getErrorTexts(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('mat-error')).map((error) =>
      (error as HTMLElement).textContent?.trim() ?? '',
    );
  }
});
