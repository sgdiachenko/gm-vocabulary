import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Field, disabled, form, required } from '@angular/forms/signals';
import { MatSelect } from '@angular/material/select';

import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;
  let field: Field<string>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent]
    }).compileComponents();

    field = createField();
    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('field', field);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the field label', async () => {
    fixture.componentRef.setInput('fieldLabel', 'Filter by collection');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('mat-label').textContent.trim()).toBe('Filter by collection');
  });

  it('should expose the default all option value', () => {
    expect(component.defaultOptionValue).toBe('ALL');
  });

  it('should bind the Material select value to the signal form field', async () => {
    field().value.set('collection-id');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getMatSelect().value).toBe('collection-id');
  });

  it('should render the provided options', async () => {
    fixture.componentRef.setInput('options', [
      { id: 'animals', name: 'Animals' },
      { id: 'food', name: 'Food' },
    ]);
    await fixture.whenStable();

    getMatSelect().open();
    fixture.detectChanges();
    await fixture.whenStable();

    const optionTexts = Array.from(document.querySelectorAll('mat-option')).map((option) =>
      (option as HTMLElement).textContent?.trim(),
    );

    expect(optionTexts).toEqual(['All', 'Animals', 'Food']);
  });

  it('should emit value changes when selection changes', () => {
    const valueChangeSpy = vi.fn();
    component.valueChange.subscribe(valueChangeSpy);

    getMatSelect().selectionChange.emit({
      source: getMatSelect(),
      value: 'collection-id',
    });

    expect(valueChangeSpy).toHaveBeenCalledWith('collection-id');
  });

  it('should disable the Material select when the signal form field is disabled', async () => {
    field = createField({ isDisabled: true });
    fixture.componentRef.setInput('field', field);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getMatSelect().disabled).toBe(true);
  });

  it('should render field errors after the field is dirty', async () => {
    field().value.set('');
    field().markAsDirty();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getErrorTexts()).toEqual(['This field is required']);
  });

  it('should hide errors while the field is clean', async () => {
    field().value.set('');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(field().errors().length).toBeGreaterThan(0);
    expect(getErrorTexts()).toEqual([]);
  });

  function createField(options: { isDisabled?: boolean } = {}): Field<string> {
    return TestBed.runInInjectionContext(() =>
      form(signal('ALL'), (schemaPath) => {
        required(schemaPath, { message: 'This field is required' });
        disabled(schemaPath, { when: () => options.isDisabled === true });
      }),
    );
  }

  function getMatSelect(): MatSelect {
    return fixture.debugElement.query((debugElement) => debugElement.componentInstance instanceof MatSelect)
      .componentInstance;
  }

  function getErrorTexts(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('mat-error')).map((error) =>
      (error as HTMLElement).textContent?.trim() ?? '',
    );
  }
});
