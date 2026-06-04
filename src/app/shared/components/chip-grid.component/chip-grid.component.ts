import { ControlValueAccessor, FormsModule, NgControl, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatChipGrid, MatChipInput, MatChipInputEvent, MatChipRow } from '@angular/material/chips';
import { MatError, MatFormField, MatLabel } from '@angular/material/input';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatIcon } from '@angular/material/icon';
import { LowerCasePipe } from '@angular/common';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
  MatOption
} from '@angular/material/autocomplete';
import { map } from 'rxjs';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  model,
  OnChanges,
  Self,
  signal,
  Signal,
  SimpleChanges,
  WritableSignal
} from '@angular/core';


import { SelectOption } from '../../interfaces/select-option';

@Component({
  selector: 'gm-chip-grid',
  imports: [
    MatFormField,
    MatLabel,
    MatChipGrid,
    MatChipRow,
    MatIcon,
    MatAutocomplete,
    MatOption,
    FormsModule,
    MatAutocompleteTrigger,
    MatError,
    MatChipInput,
    LowerCasePipe,
    ReactiveFormsModule,
  ],
  templateUrl: './chip-grid.component.html',
  styleUrl: './chip-grid.component.scss',
})
export class ChipGridComponent implements ControlValueAccessor, OnChanges {
  private readonly destroyRef = inject(DestroyRef);

  fieldLabel = input(null);
  fieldPlaceholder = input(null);
  fieldErrors = input([]);
  chips = input([]);

  inputControl: UntypedFormControl;
  readonly currentChip = model('');
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  selectedChips: WritableSignal<string[]> = signal([]);
  onTouch: () => void;

  private readonly inputControlValue: Signal<string>;
  private readonly initialChips: WritableSignal<SelectOption[]> = signal([]);
  filteredChips: Signal<SelectOption[]>;

  constructor(@Self() public controlDir: NgControl) {
    controlDir.valueAccessor = this;
    this.inputControl = new UntypedFormControl();
    this.inputControlValue = toSignal(this.inputControl.valueChanges, {initialValue: ''});
    this.filteredChips = computed(() => this.getFilteredChips(this.inputControlValue(), this.initialChips()));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chips']?.currentValue) {
      this.initialChips.set(changes['chips']?.currentValue);
      if (this.inputControl.value != null && this.inputControl.value !== '') {
        const selectedChips = this.inputControl.value.split(', ').map(chipId => this.getChipNameById(chipId));
        this.selectedChips.set(selectedChips);
      }
    }
  }

  writeValue(chips: string) {
    this.inputControl.setValue(chips ?? '', {emitEvent: false});
  }

  registerOnChange(fn: any): void {
    this.inputControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((value: string) => {
          return value.split(', ').map(chipName => this.getChipIdByName(chipName) || chipName).join(', ');
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

  private getFilteredChips(value: string, chips: SelectOption[]): SelectOption[] {
    const inputValue = value.trim().toLowerCase();
    if (inputValue === '') {
      return chips;
    }

    const selectedChips: string[] = inputValue.split(', ');
    let filteredChips: SelectOption[] = [];

    if (chips?.length > 0) {
      filteredChips = chips.filter(allChipsItem => {
        return selectedChips.findIndex(chipName => chipName.toLowerCase() === allChipsItem.name.toLowerCase()) === -1
      });
    }

    // const isUniqueValue = filteredChips.length === 0 || filteredChips.findIndex((chip: SelectOption) => chip.name.toLowerCase() === inputValue) === -1
    // if (isUniqueValue) {
    //   filteredChips.unshift({id: null, name: value, isCustom: true});
    // }

    return filteredChips;
  }

  private getChipNameById(id: string): string {
    return this.findChip('id', id)?.name;
  }

  private getChipIdByName(name: string): string {
    return this.findChip('name', name)?.id;
  }

  private findChip(parameter: string, value: string): SelectOption {
    return this.chips()?.find(chip => chip[parameter] === value);
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.selectedChips.update(chips => [...chips, value]);
      this.inputControl.setValue(this.selectedChips().join(', '));
    }

    // Clear the input value
    this.currentChip.set('');
  }

  remove(fruit: string): void {
    this.selectedChips.update(chips => {
      const index = chips.indexOf(fruit);
      if (index < 0) {
        return chips;
      }

      chips.splice(index, 1);
      return [...chips];
    });
    this.inputControl.setValue(this.selectedChips().join(', '));
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedChips.update(chips => [...chips, event.option.viewValue]);
    this.currentChip.set('');
    this.inputControl.setValue(this.selectedChips().join(', '));
    event.option.deselect();
  }
}
