import { ControlValueAccessor, FormsModule, NgControl, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
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
  OnChanges,
  Self,
  signal,
  Signal,
  SimpleChanges,
  WritableSignal
} from '@angular/core';

import { SelectOption } from '../../interfaces/select-option';

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
export class AutocompleteComponent implements ControlValueAccessor, OnChanges {
  private readonly destroyRef = inject(DestroyRef);

  fieldLabel = input<string>(null);
  fieldPlaceholder = input<string>(null);
  fieldErrors = input<string[]>([]);
  options = input<SelectOption[]>([]);
  allowCustomValue = input<boolean>(false);

  inputControl: UntypedFormControl;
  onTouch: () => void;

  private readonly inputControlValue: Signal<string>;
  private readonly initialOptions: WritableSignal<SelectOption[]> = signal([]);
  filteredOptions: Signal<SelectOption[]>;

  constructor(@Self() public controlDir: NgControl) {
    controlDir.valueAccessor = this;
    this.inputControl = new UntypedFormControl();
    this.inputControlValue = toSignal(this.inputControl.valueChanges, {initialValue: ''});
    this.filteredOptions = computed(() => this.getFilteredOptions(this.inputControlValue(), this.initialOptions()));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']?.currentValue) {
      this.initialOptions.set(this.options());
      if (this.inputControl.value != null && this.inputControl.value !== '') {
        this.inputControl.setValue(this.getOptionNameById(this.inputControl.value), {emitEvent: false});
      }
    }
  }

  writeValue(id: string) {
    this.inputControl.setValue(this.options?.length > 0 ? this.getOptionNameById(id) || id : id, {emitEvent: false});
  }

  registerOnChange(fn: any): void {
    this.inputControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((value: string) => {
          console.log(this.options?.length > 0 ? this.getOptionIdByName(value) || value : value)
          return this.options?.length > 0 ? this.getOptionIdByName(value) || value : value
        })
      )
      .subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.inputControl.disable({emitEvent: false, onlySelf: true}) :
      this.inputControl.enable({emitEvent: false, onlySelf: true});
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
      const isUniqueValue = filteredOptions.length === 0 || filteredOptions.findIndex((option: SelectOption) => option.name.toLowerCase() === filterValue) === -1
      if (isUniqueValue) {
        filteredOptions.unshift({id: null, name: value, isCustom: true});
      }
    }
    return filteredOptions;
  }

  private getOptionNameById(id: string): string {
    return this.findOption('id', id)?.name;
  }

  private getOptionIdByName(name: string): string {
    return this.findOption('name', name)?.id;
  }

  private findOption(parameter: string, value: string): SelectOption {
    return this.options()?.find(option => option[parameter] === value);
  }
}
