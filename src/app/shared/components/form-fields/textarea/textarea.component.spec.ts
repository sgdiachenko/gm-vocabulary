import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Field, form, required } from '@angular/forms/signals';

import { TextareaComponent } from './textarea.component';

describe('TextareaComponent', () => {
  let component: TextareaComponent;
  let fixture: ComponentFixture<TextareaComponent>;
  let field: Field<string>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaComponent],
    }).compileComponents();

    field = createField();
    fixture = TestBed.createComponent(TextareaComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('field', field);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the label, generated placeholder, and default rows', async () => {
    fixture.componentRef.setInput('fieldLabel', 'Description');
    await fixture.whenStable();

    expect(getLabelText()).toContain('Description');
    expect(getTextarea().placeholder).toBe('Enter description');
    expect(getTextarea().rows).toBe(2);
  });

  it('should render an explicit placeholder and rows', async () => {
    fixture.componentRef.setInput('fieldPlaceholder', 'Add details');
    fixture.componentRef.setInput('rows', 6);
    await fixture.whenStable();

    expect(getTextarea().placeholder).toBe('Add details');
    expect(getTextarea().rows).toBe(6);
  });

  it('should bind the textarea value to the signal form field', async () => {
    field().value.set('Initial value');
    await fixture.whenStable();

    expect(getTextarea().value).toBe('Initial value');

    getTextarea().value = 'Updated value';
    getTextarea().dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(field().value()).toBe('Updated value');
  });

  it('should render field errors after the field is dirty', async () => {
    field().markAsDirty();
    await fixture.whenStable();

    expect(getErrorTexts()).toEqual(['This field is required']);
  });

  it('should hide errors while the field is clean', () => {
    expect(field().errors().length).toBeGreaterThan(0);
    expect(getErrorTexts()).toEqual([]);
  });

  function createField(): Field<string> {
    return TestBed.runInInjectionContext(() =>
      form(signal({ value: '' }), (schemaPath) => {
        required(schemaPath.value, { message: 'This field is required' });
      }).value,
    );
  }

  function getTextarea(): HTMLTextAreaElement {
    return fixture.nativeElement.querySelector('textarea');
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
