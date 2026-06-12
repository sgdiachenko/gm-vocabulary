import { ControlValueAccessor, FormControl, FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { LowerCasePipe, NgClass } from '@angular/common';
import { map } from 'rxjs';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  Self,
  Signal,
} from '@angular/core';

import { SelectOption } from '../../../interfaces/select-option';

@Component({
  selector: 'gm-autocomplete',
  imports: [
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    FormsModule,
    LowerCasePipe,
    ReactiveFormsModule,
    MatError,
    NgClass,
  ],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss',
})
export class AutocompleteComponent implements ControlValueAccessor {
  private readonly destroyRef = inject(DestroyRef);

  fieldLabel = input<string | null>(null);
  fieldPlaceholder = input<string | null>(null);
  fieldErrors = input<string[]>([]);
  options = input<SelectOption[]>([]);
  allowCustomValue = input<boolean>(false);

  inputControl = new FormControl<string>('', { nonNullable: true });
  onTouch: () => void = () => {};

  private readonly inputControlValue: Signal<string>;
  private readonly normalizedOptions = computed(() => this.options() ?? []);
  private readonly optionNameById = computed(() =>
    new Map(this.normalizedOptions().map(({ id, name }) => [id, name])),
  );
  private readonly optionIdByName = computed(() =>
    new Map(this.normalizedOptions().map(({ id, name }) => [name, id])),
  );
  filteredOptions: Signal<SelectOption[]> = computed(() =>
    this.getFilteredOptions(this.inputControlValue(), this.normalizedOptions()),
  );

  constructor(@Self() public controlDir: NgControl) {
    controlDir.valueAccessor = this;
    this.inputControlValue = toSignal(this.inputControl.valueChanges, { initialValue: '' });
  }

  writeValue(id: string | null): void {
    this.inputControl.setValue(this.getOptionNameById(id) || id || '', { emitEvent: false });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.inputControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((value: string) => this.getOptionIdByName(value) || value),
      )
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

  private getFilteredOptions(value: string, options: SelectOption[]): SelectOption[] {
    const filterValue = value.trim().toLowerCase();
    if (filterValue === '') {
      return options;
    }

    let filteredOptions: SelectOption[] = [];

    if (options?.length > 0) {
      filteredOptions = options.filter(option => option.name.toLowerCase().includes(filterValue));
    }

    if (this.allowCustomValue() && value != '') {
      const isUniqueValue = filteredOptions.every(
        (option: SelectOption) => option.name.toLowerCase() !== filterValue,
      );

      if (isUniqueValue) {
        filteredOptions.unshift({ id: value, name: value, isCustom: true });
      }
    }

    return filteredOptions;
  }

  private getOptionNameById(id: string | null): string | undefined {
    return id == null ? undefined : this.optionNameById().get(id);
  }

  private getOptionIdByName(name: string): string | undefined {
    return this.optionIdByName().get(name);
  }
}
