import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { Field, FormField } from '@angular/forms/signals';
import { LowerCasePipe, NgClass } from '@angular/common';
import { Component, computed, input, Signal } from '@angular/core';

import { createSignalFormFieldState } from '@gm-vocabulary/shared/util';
import { SelectOption } from '@gm-vocabulary/shared/util';

@Component({
  selector: 'gm-autocomplete',
  imports: [
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    LowerCasePipe,
    FormField,
    MatError,
    NgClass,
  ],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss',
})
export class AutocompleteComponent {
  field = input.required<Field<string>>();
  fieldLabel = input<string | null>(null);
  fieldPlaceholder = input<string | null>(null);
  options = input<SelectOption[]>([]);
  allowCustomValue = input<boolean>(false);

  private readonly fieldState = createSignalFormFieldState(this.field);
  readonly state = this.fieldState.state;
  readonly errors = this.fieldState.errors;
  readonly showErrors = this.fieldState.showErrors;

  private readonly normalizedOptions = computed(() => this.options() ?? []);
  private readonly optionNameById = computed(
    () => new Map(this.normalizedOptions().map(({ id, name }) => [id, name])),
  );
  private readonly inputValue = computed(
    () => this.getOptionNameById(this.state().value()) ?? this.state().value() ?? '',
  );
  filteredOptions: Signal<SelectOption[]> = computed(() =>
    this.getFilteredOptions(this.inputValue(), this.normalizedOptions()),
  );

  readonly displayOption = (value: string | null): string =>
    this.getOptionNameById(value) ?? value ?? '';

  private getFilteredOptions(value: string, options: SelectOption[]): SelectOption[] {
    const filterValue = value.trim().toLowerCase();
    if (filterValue === '') {
      return options;
    }

    let filteredOptions: SelectOption[] = [];

    if (options?.length > 0) {
      filteredOptions = options.filter((option) => option.name.toLowerCase().includes(filterValue));
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
}
