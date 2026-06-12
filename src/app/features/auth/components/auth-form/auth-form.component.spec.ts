import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthFormComponent } from './auth-form.component';
import { Auth } from '../../interfaces/auth';

describe('AuthFormComponent', () => {
  let component: AuthFormComponent;
  let fixture: ComponentFixture<AuthFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render login mode by default', async () => {
    await fixture.whenStable();

    expect(getHeading().textContent).toContain('Login');
    expect(component.formGroup.contains(component.repeatPasswordControlName)).toBe(false);
    expect(getInputByLabel('Repeat Password')).toBeNull();
    expect(getToggleLink().textContent).toContain('Signup');
  });

  it('should render signup mode and add repeat password control when signup input is true', async () => {
    fixture.componentRef.setInput('isSignupFormActive', true);
    await fixture.whenStable();

    expect(getHeading().textContent).toContain('Signup');
    expect(component.formGroup.contains(component.repeatPasswordControlName)).toBe(true);
    expect(component.formGroup.get(component.repeatPasswordControlName)?.hasError('required')).toBe(true);
    expect(getInputByLabel('Repeat Password')).not.toBeNull();
    expect(getToggleLink().textContent).toContain('Login');
  });

  it('should remove repeat password control after switching back to login mode', async () => {
    fixture.componentRef.setInput('isSignupFormActive', true);
    await fixture.whenStable();

    fixture.componentRef.setInput('isSignupFormActive', false);
    await fixture.whenStable();

    expect(component.formGroup.contains(component.repeatPasswordControlName)).toBe(false);
    expect(getInputByLabel('Repeat Password')).toBeNull();
  });

  it('should emit the opposite view when the mode toggle is clicked', async () => {
    const toggleViewSpy = vi.fn();
    component.toggleView.subscribe(toggleViewSpy);

    getToggleLink().click();
    await fixture.whenStable();

    expect(toggleViewSpy).toHaveBeenCalledWith(true);

    fixture.componentRef.setInput('isSignupFormActive', true);
    await fixture.whenStable();

    getToggleLink().click();
    await fixture.whenStable();

    expect(toggleViewSpy).toHaveBeenLastCalledWith(false);
  });

  it('should disable submit until login form is dirty and valid', async () => {
    expect(getSubmitButton().disabled).toBe(true);

    setControlValue(component.emailControlName, 'not-an-email');
    setControlValue(component.passwordControlName, 'secret');
    await fixture.whenStable();

    expect(component.formGroup.invalid).toBe(true);
    expect(getSubmitButton().disabled).toBe(true);

    setControlValue(component.emailControlName, 'test@example.com');
    await fixture.whenStable();

    expect(component.formGroup.valid).toBe(true);
    expect(getSubmitButton().disabled).toBe(false);
  });

  it('should emit email and password when a valid login form is submitted', async () => {
    const submitSpy = vi.fn<(auth: Auth) => void>();
    component.submitForm.subscribe(submitSpy);
    setControlValue(component.emailControlName, 'test@example.com');
    setControlValue(component.passwordControlName, 'secret');
    await fixture.whenStable();

    getForm().requestSubmit();
    await fixture.whenStable();

    expect(submitSpy).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'secret',
    });
  });

  it('should show validation messages only after the control is dirty', async () => {
    expect(component.getControlErrorsMessages(component.emailControlName)).toBeNull();

    setControlValue(component.emailControlName, '');
    await fixture.whenStable();

    expect(component.getControlErrorsMessages(component.emailControlName)).toEqual([
      'This field is required',
    ]);

    setControlValue(component.emailControlName, 'not-an-email');
    await fixture.whenStable();

    expect(component.getControlErrorsMessages(component.emailControlName)).toEqual([
      'Email is not valid',
    ]);
  });

  it('should show passwords mismatch error in signup mode', async () => {
    fixture.componentRef.setInput('isSignupFormActive', true);
    await fixture.whenStable();

    setControlValue(component.emailControlName, 'test@example.com');
    setControlValue(component.passwordControlName, 'secret');
    setControlValue(component.repeatPasswordControlName, 'different');
    await fixture.whenStable();

    expect(component.formGroup.hasError('passwordsMismatch')).toBe(true);
    expect(getErrorsText()).toContain('Passwords do not match');

    setControlValue(component.repeatPasswordControlName, 'secret');
    await fixture.whenStable();

    expect(component.formGroup.hasError('passwordsMismatch')).toBe(false);
    expect(getErrorsText()).not.toContain('Passwords do not match');
  });

  function setControlValue(controlName: string, value: string): void {
    const control = component.formGroup.get(controlName);

    control?.setValue(value);
    control?.markAsDirty();
  }

  function getForm(): HTMLFormElement {
    return fixture.nativeElement.querySelector('form');
  }

  function getHeading(): HTMLHeadingElement {
    return fixture.nativeElement.querySelector('h1');
  }

  function getToggleLink(): HTMLAnchorElement {
    return fixture.nativeElement.querySelector('a[matbutton]');
  }

  function getSubmitButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]');
  }

  function getInputByLabel(labelText: string): HTMLInputElement | null {
    const formFields = Array.from(
      fixture.nativeElement.querySelectorAll('mat-form-field'),
    ) as HTMLElement[];

    return formFields
      .find((field) => field.querySelector('label')?.textContent?.includes(labelText))
      ?.querySelector('input') ?? null;
  }

  function getErrorsText(): string {
    return fixture.nativeElement.textContent;
  }
});
