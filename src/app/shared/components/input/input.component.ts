import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { Component, DestroyRef, inject, input, Self } from '@angular/core';
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

  fieldLabel = input<string | null>(null);
  fieldPlaceholder = input<string | null>(null);
  fieldType = input<string>('text');
  fieldErrors = input<string[]>([]);

  inputControl = new FormControl<string>('', { nonNullable: true });
  private onTouch: () => void = () => {};

  constructor(@Self() public controlDir: NgControl) {
    controlDir.valueAccessor = this;
  }

  writeValue(value: string | null): void {
    this.inputControl.setValue(value ?? '', { emitEvent: false });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.inputControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    const options = { emitEvent: false, onlySelf: true };

    if (isDisabled) {
      this.inputControl.disable(options);
      return;
    }

    this.inputControl.enable(options);
  }
}
