import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';

import { SlideToggleComponent } from './slide-toggle.component';

describe('SlideToggleComponent', () => {
  let component: SlideToggleComponent;
  let fixture: ComponentFixture<SlideToggleComponent>;
  let ngControl: { valueAccessor: unknown };

  beforeEach(async () => {
    ngControl = { valueAccessor: null };

    await TestBed.configureTestingModule({
      imports: [SlideToggleComponent],
    })
    .overrideComponent(SlideToggleComponent, {
      add: {
        providers: [
          { provide: NgControl, useValue: ngControl },
        ],
      },
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlideToggleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register itself as the control value accessor', () => {
    expect(ngControl.valueAccessor).toBe(component);
  });

  it('should render a Material slide toggle', async () => {
    await fixture.whenStable();

    expect(getSlideToggle()).toBeTruthy();
  });

  it('should write boolean values without notifying registered change handlers', async () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);

    component.writeValue(true);
    await fixture.whenStable();

    expect(component.inputControl.value).toBe(true);
    expect(getSlideToggle().getAttribute('aria-checked')).toBe('true');
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('should write false when the incoming value is null', async () => {
    component.writeValue(true);
    await fixture.whenStable();

    component.writeValue(null);
    await fixture.whenStable();

    expect(component.inputControl.value).toBe(false);
    expect(getSlideToggle().getAttribute('aria-checked')).toBe('false');
  });

  it('should notify registered change handlers when the input control changes', () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);

    component.inputControl.setValue(true);

    expect(onChangeSpy).toHaveBeenCalledWith(true);
  });

  it('should toggle disabled state without notifying registered change handlers', async () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);

    component.setDisabledState(true);
    await fixture.whenStable();

    expect(component.inputControl.disabled).toBe(true);
    expect(getSlideToggle().disabled).toBe(true);
    expect(onChangeSpy).not.toHaveBeenCalled();

    component.setDisabledState(false);
    await fixture.whenStable();

    expect(component.inputControl.enabled).toBe(true);
    expect(getSlideToggle().disabled).toBe(false);
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('should call registered touch handler on blur', async () => {
    const onTouchSpy = vi.fn();
    component.registerOnTouched(onTouchSpy);
    await fixture.whenStable();

    getMaterialSlideToggle().dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();

    expect(onTouchSpy).toHaveBeenCalled();
  });

  function getMaterialSlideToggle(): HTMLElement {
    return fixture.nativeElement.querySelector('mat-slide-toggle');
  }

  function getSlideToggle(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[role="switch"]');
  }
});
