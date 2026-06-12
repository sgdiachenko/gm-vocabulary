import { Component, DestroyRef, inject, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'gm-slide-toggle',
  imports: [
    MatSlideToggle,
    ReactiveFormsModule,
  ],
  templateUrl: './slide-toggle.component.html',
  styleUrl: './slide-toggle.component.scss',
})
export class SlideToggleComponent implements ControlValueAccessor {
  private readonly destroyRef = inject(DestroyRef);

  inputControl = new FormControl<boolean>(false, { nonNullable: true });
  protected onTouch: () => void = () => {};

  constructor(@Self() public controlDir: NgControl) {
    controlDir.valueAccessor = this;
  }

  writeValue(value: boolean | null): void {
    this.inputControl.setValue(value ?? false, { emitEvent: false });
  }

  registerOnChange(fn: (value: boolean) => void): void {
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
