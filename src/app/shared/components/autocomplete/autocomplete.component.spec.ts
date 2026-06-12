import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';

import { AutocompleteComponent } from './autocomplete.component';

describe('AutocompleteComponent', () => {
  let component: AutocompleteComponent;
  let fixture: ComponentFixture<AutocompleteComponent>;
  let ngControl: { valueAccessor: unknown };

  beforeEach(async () => {
    ngControl = { valueAccessor: null };

    await TestBed.configureTestingModule({
      imports: [AutocompleteComponent],
    })
    .overrideComponent(AutocompleteComponent, {
      add: {
        providers: [
          { provide: NgControl, useValue: ngControl },
        ],
      },
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutocompleteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register itself as the control value accessor', () => {
    expect(ngControl.valueAccessor).toBe(component);
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

  it('should write an option name for a known option id', async () => {
    fixture.componentRef.setInput('options', [
      { id: '1', name: 'Animals' },
      { id: '2', name: 'Food' },
    ]);
    await fixture.whenStable();

    component.writeValue('2');
    await fixture.whenStable();

    expect(component.inputControl.value).toBe('Food');
    expect(getInput().value).toBe('Food');
  });

  it('should write the incoming value when option id is unknown', async () => {
    fixture.componentRef.setInput('options', [{ id: '1', name: 'Animals' }]);
    await fixture.whenStable();

    component.writeValue('New Group');
    await fixture.whenStable();

    expect(component.inputControl.value).toBe('New Group');
    expect(getInput().value).toBe('New Group');
  });

  it('should write an empty string when the incoming value is null', async () => {
    component.writeValue('Initial value');
    await fixture.whenStable();

    component.writeValue(null);
    await fixture.whenStable();

    expect(component.inputControl.value).toBe('');
    expect(getInput().value).toBe('');
  });

  it('should emit an option id when a known option name is selected', async () => {
    const onChangeSpy = vi.fn();
    fixture.componentRef.setInput('options', [{ id: '1', name: 'Animals' }]);
    component.registerOnChange(onChangeSpy);
    await fixture.whenStable();

    component.inputControl.setValue('Animals');

    expect(onChangeSpy).toHaveBeenCalledWith('1');
  });

  it('should emit the typed value when no option name matches', async () => {
    const onChangeSpy = vi.fn();
    fixture.componentRef.setInput('options', [{ id: '1', name: 'Animals' }]);
    component.registerOnChange(onChangeSpy);
    await fixture.whenStable();

    component.inputControl.setValue('New Group');

    expect(onChangeSpy).toHaveBeenCalledWith('New Group');
  });

  it('should filter options by typed value', async () => {
    fixture.componentRef.setInput('options', [
      { id: '1', name: 'Animals' },
      { id: '2', name: 'Food' },
      { id: '3', name: 'Another' },
    ]);
    await fixture.whenStable();

    component.inputControl.setValue('ani');
    await fixture.whenStable();

    expect(component.filteredOptions()).toEqual([{ id: '1', name: 'Animals' }]);
  });

  it('should add a custom option when custom values are allowed and value is unique', async () => {
    fixture.componentRef.setInput('allowCustomValue', true);
    fixture.componentRef.setInput('options', [{ id: '1', name: 'Animals' }]);
    await fixture.whenStable();

    component.inputControl.setValue('Plants');
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

    component.inputControl.setValue('animals');
    await fixture.whenStable();

    expect(component.filteredOptions()).toEqual([{ id: '1', name: 'Animals' }]);
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
});
