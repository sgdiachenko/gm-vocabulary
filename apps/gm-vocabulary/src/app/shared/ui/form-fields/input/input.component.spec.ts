import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Field, form, required } from '@angular/forms/signals';

import { InputComponent } from './input.component';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;
  let field: Field<string>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent],
    }).compileComponents();

    field = createField();
    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('field', field);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

  it('should bind the native input value to the signal form field', async () => {
    field().value.set('Initial value');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getInput().value).toBe('Initial value');

    getInput().value = 'Typed value';
    getInput().dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(field().value()).toBe('Typed value');
  });

  it('should render field errors after the field is dirty', async () => {
    field().markAsDirty();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getErrorTexts()).toEqual(['This field is required']);
  });

  it('should hide errors while the field is clean', async () => {
    await fixture.whenStable();

    expect(field().errors().length).toBeGreaterThan(0);
    expect(getErrorTexts()).toEqual([]);
  });

  function createField(): Field<string> {
    return TestBed.runInInjectionContext(
      () =>
        form(signal({ value: '' }), (schemaPath) => {
          required(schemaPath.value, { message: 'This field is required' });
        }).value,
    );
  }

  function getInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input');
  }

  function getLabelText(): string {
    return fixture.nativeElement.querySelector('mat-label')?.textContent?.trim() ?? '';
  }

  function getErrorTexts(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('mat-error')).map(
      (error) => (error as HTMLElement).textContent?.trim() ?? '',
    );
  }
});
