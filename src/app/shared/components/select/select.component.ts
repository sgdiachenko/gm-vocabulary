import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, Self } from '@angular/core';
import { ControlValueAccessor, NgControl, UntypedFormControl } from '@angular/forms';
import { DefaultOptionValueEnum } from '../../../enums/default-option-value.enum';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectOption } from '../../interfaces/select-option';

@Component({
  selector: 'gm-select',
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption
  ],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent implements ControlValueAccessor {
  private readonly destroyRef = inject(DestroyRef);
  readonly defaultOptionValue = DefaultOptionValueEnum.ALL;

  fieldLabel = input(null);
  options = input<SelectOption[]>([]);

  inputControl: UntypedFormControl;
  onTouch: () => void;

  constructor(@Self() public controlDir: NgControl) {
    controlDir.valueAccessor = this;
    this.inputControl = new UntypedFormControl();
  }

  writeValue(id: string) {
    this.inputControl.setValue(id, {emitEvent: false});
  }

  registerOnChange(fn: any): void {
    this.inputControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef),)
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
