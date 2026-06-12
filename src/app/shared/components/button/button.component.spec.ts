import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render an elevated button by default', async () => {
    await fixture.whenStable();

    const button = getButton();

    expect(button.getAttribute('type')).toBe('button');
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.classList).toContain('mat-mdc-raised-button');
  });

  it('should render a primary submit button when configured', async () => {
    fixture.componentRef.setInput('isPrimary', true);
    fixture.componentRef.setInput('isSubmit', true);
    await fixture.whenStable();

    const button = getButton();

    expect(button.getAttribute('type')).toBe('submit');
    expect(button.classList).toContain('mat-mdc-unelevated-button');
  });

  it('should disable the button when disabled input is true', async () => {
    fixture.componentRef.setInput('isDisabled', true);
    await fixture.whenStable();

    expect(getButton().disabled).toBe(true);
  });

  it('should emit click events from the native button', async () => {
    const btnClickSpy = vi.fn();
    component.btnClick.subscribe(btnClickSpy);
    await fixture.whenStable();

    getButton().click();

    expect(btnClickSpy).toHaveBeenCalledOnce();
  });

  function getButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }
});
