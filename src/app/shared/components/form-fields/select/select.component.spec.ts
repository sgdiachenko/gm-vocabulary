import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';

import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;
  let ngControl: { valueAccessor: unknown };

  beforeEach(async () => {
    ngControl = { valueAccessor: null };

    await TestBed.configureTestingModule({
      imports: [SelectComponent]
    })
    .overrideComponent(SelectComponent, {
      add: {
        providers: [
          { provide: NgControl, useValue: ngControl }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register itself as the control value accessor', () => {
    expect(ngControl.valueAccessor).toBe(component);
  });

  it('should render the field label', async () => {
    fixture.componentRef.setInput('fieldLabel', 'Filter by collection');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('mat-label').textContent.trim()).toBe('Filter by collection');
  });

  it('should expose the default all option value', () => {
    expect(component.defaultOptionValue).toBe('ALL');
  });

  it('should write values without notifying registered change handlers', () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);

    component.writeValue('collection-id');

    expect(component.inputControl.value).toBe('collection-id');
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('should notify registered change handlers when the control changes', () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);

    component.inputControl.setValue('collection-id');

    expect(onChangeSpy).toHaveBeenCalledWith('collection-id');
  });

  it('should store registered touch handler', () => {
    const onTouchSpy = vi.fn();

    component.registerOnTouched(onTouchSpy);
    component.onTouch();

    expect(onTouchSpy).toHaveBeenCalledOnce();
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
});
