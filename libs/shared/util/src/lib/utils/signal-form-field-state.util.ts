import { computed, Signal } from '@angular/core';
import { Field } from '@angular/forms/signals';

export function createSignalFormFieldState<T>(field: Signal<Field<T>>) {
  const state = computed(() => field()());
  const errors = computed(() => state().errors());
  const showErrors = computed(() => (state().dirty() || state().touched()) && errors().length > 0);

  return {
    state,
    errors,
    showErrors,
  } as const;
}
