import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Field, disabled, form } from '@angular/forms/signals';

import { SlideToggleComponent } from './slide-toggle.component';

describe('SlideToggleComponent', () => {
  let component: SlideToggleComponent;
  let fixture: ComponentFixture<SlideToggleComponent>;
  let field: Field<boolean>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlideToggleComponent],
    }).compileComponents();

    field = createField();
    fixture = TestBed.createComponent(SlideToggleComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('field', field);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a Material slide toggle', () => {
    expect(getSlideToggle()).toBeTruthy();
  });

  it('should bind the Material slide toggle checked state to the signal form field', async () => {
    field().value.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getSlideToggle().getAttribute('aria-checked')).toBe('true');
  });

  it('should update the signal form field when the toggle changes', async () => {
    getSlideToggle().click();
    await fixture.whenStable();

    expect(field().value()).toBe(true);
  });

  it('should disable the Material slide toggle when the signal form field is disabled', async () => {
    field = createField({ isDisabled: true });
    fixture.componentRef.setInput('field', field);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getSlideToggle().disabled).toBe(true);
  });

  function createField(options: { isDisabled?: boolean } = {}): Field<boolean> {
    return TestBed.runInInjectionContext(() =>
      form(signal({ value: false }), (schemaPath) => {
        disabled(schemaPath.value, { when: () => options.isDisabled === true });
      }).value,
    );
  }

  function getSlideToggle(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[role="switch"]');
  }
});
