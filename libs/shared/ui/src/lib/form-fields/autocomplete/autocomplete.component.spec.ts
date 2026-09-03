import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Field, disabled, form, required } from '@angular/forms/signals';

import { AutocompleteComponent } from './autocomplete.component';

describe('AutocompleteComponent', () => {
  let component: AutocompleteComponent;
  let fixture: ComponentFixture<AutocompleteComponent>;
  let field: Field<string>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocompleteComponent],
    }).compileComponents();

    field = createField();
    fixture = TestBed.createComponent(AutocompleteComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('field', field);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label, generated placeholder, and text input type', async () => {
    fixture.componentRef.setInput('fieldLabel', 'Word Group');
    await fixture.whenStable();

    expect(getLabelText()).toContain('Word Group');
    expect(getInput().placeholder).toBe('Enter word group');
    expect(getInput().type).toBe('text');
  });

  it('should render explicit placeholder when provided', async () => {
    fixture.componentRef.setInput('fieldLabel', 'Word Group');
    fixture.componentRef.setInput('fieldPlaceholder', 'Choose group');
    await fixture.whenStable();

    expect(getInput().placeholder).toBe('Choose group');
  });

  it('should display an option name for a known option id', async () => {
    fixture.componentRef.setInput('options', [
      { id: '1', name: 'Animals' },
      { id: '2', name: 'Food' },
    ]);
    await fixture.whenStable();

    field().value.set('2');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getInput().value).toBe('Food');
    expect(component.displayOption('2')).toBe('Food');
  });

  it('should display the field value when option id is unknown', async () => {
    field().value.set('New Group');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getInput().value).toBe('New Group');
    expect(component.displayOption('New Group')).toBe('New Group');
  });

  it('should update the signal form field with the typed value', async () => {
    getInput().value = 'New Group';
    getInput().dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(field().value()).toBe('New Group');
  });

  it('should filter options by typed value', async () => {
    fixture.componentRef.setInput('options', [
      { id: '1', name: 'Animals' },
      { id: '2', name: 'Food' },
      { id: '3', name: 'Another' },
    ]);
    await fixture.whenStable();

    field().value.set('ani');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.filteredOptions()).toEqual([{ id: '1', name: 'Animals' }]);
  });

  it('should add a custom option when custom values are allowed and value is unique', async () => {
    fixture.componentRef.setInput('allowCustomValue', true);
    fixture.componentRef.setInput('options', [{ id: '1', name: 'Animals' }]);
    await fixture.whenStable();

    field().value.set('Plants');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.filteredOptions()[0]).toEqual({
      id: 'Plants',
      name: 'Plants',
      isCustom: true,
    });
  });

  it('should not add a custom option when typed value matches an option name', async () => {
    fixture.componentRef.setInput('allowCustomValue', true);
    fixture.componentRef.setInput('options', [{ id: '1', name: 'Animals' }]);
    await fixture.whenStable();

    field().value.set('animals');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.filteredOptions()).toEqual([{ id: '1', name: 'Animals' }]);
  });

  it('should render field errors after the field is dirty', async () => {
    field().markAsDirty();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getErrorTexts()).toEqual(['This field is required']);
  });

  it('should disable the input when the signal form field is disabled', async () => {
    field = createField({ isDisabled: true });
    fixture.componentRef.setInput('field', field);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getInput().disabled).toBe(true);
  });

  function createField(options: { isDisabled?: boolean } = {}): Field<string> {
    return TestBed.runInInjectionContext(() =>
      form(signal(''), (schemaPath) => {
        required(schemaPath, { message: 'This field is required' });
        disabled(schemaPath, { when: () => options.isDisabled === true });
      }),
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
