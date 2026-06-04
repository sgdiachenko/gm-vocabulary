import { ControlValueAccessor, NgControl, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { Component, DestroyRef, inject, input, Self } from '@angular/core';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LowerCasePipe } from '@angular/common';

@Component({
  selector: 'gm-input',
  imports: [
    MatInput,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    LowerCasePipe,
    MatError
  ],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent implements ControlValueAccessor {
  private readonly destroyRef = inject(DestroyRef);

  fieldLabel = input(null);
  fieldPlaceholder = input(null);
  fieldType = input('text');
  fieldErrors = input([]);

  inputControl: UntypedFormControl;
  onTouch: () => void;

  constructor(@Self() public controlDir: NgControl) {
    controlDir.valueAccessor = this;
    this.inputControl = new UntypedFormControl();
  }

  writeValue(value: string) {
    this.inputControl.patchValue(value, {emitEvent: false});
  }

  registerOnChange(fn: any): void {
    this.inputControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.inputControl.disable({emitEvent: false, onlySelf: true}) :
      this.inputControl.enable({emitEvent: false, onlySelf: true});
  }
}
