import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  let fixture: ComponentFixture<Checkbox>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Checkbox],
    });

    fixture = TestBed.createComponent(Checkbox);
  });

  it('renders projected content and the checked state', async () => {
    fixture.componentRef.setInput('checked', true);
    await fixture.whenStable();

    const checkbox: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="checkbox"]');

    expect(checkbox.checked).toBe(true);
  });

  it('emits the updated checked state', async () => {
    const checkedChange = vi.fn();
    fixture.componentInstance.checked.subscribe(checkedChange);
    await fixture.whenStable();

    const checkbox: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="checkbox"]');
    checkbox.click();
    await fixture.whenStable();

    expect(checkedChange).toHaveBeenCalledWith(true);
  });

  it('disables the Material checkbox', async () => {
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    const checkbox: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="checkbox"]');

    expect(checkbox.disabled).toBe(true);
  });

  it('sets the Material checkbox indeterminate state', async () => {
    fixture.componentRef.setInput('indeterminate', true);
    await fixture.whenStable();

    const checkbox: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="checkbox"]');

    expect(checkbox.indeterminate).toBe(true);
  });
});
