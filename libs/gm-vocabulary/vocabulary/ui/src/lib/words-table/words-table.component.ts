import { Component, input, linkedSignal, output } from '@angular/core';
import { Field, form } from '@angular/forms/signals';

import { SelectComponent } from '@gm-vocabulary/shared/ui';
import { ButtonComponent } from '@gm-vocabulary/shared/ui';
import { TableComponent } from '@gm-vocabulary/shared/ui';
import { DefaultOptionValueEnum } from '@gm-vocabulary/shared/util';
import { TableColumn } from '@gm-vocabulary/shared/ui';
import { SelectOption } from '@gm-vocabulary/shared/util';
import { WordsTableRow } from './words-table-row';

@Component({
  selector: 'gm-words-table',
  imports: [ButtonComponent, TableComponent, SelectComponent],
  templateUrl: './words-table.component.html',
  styleUrl: './words-table.component.scss',
})
export class WordsTableComponent {
  dataSource = input<WordsTableRow[]>([]);
  groups = input<SelectOption[]>([]);
  selectedGroupId = input<string | null>(null);
  isOwner = input<boolean>(true);
  allowSwitchGroup = input<boolean>(true);
  columns = input<TableColumn[]>([]);

  addWord = output();
  editWord = output<WordsTableRow>();
  deleteWords = output<WordsTableRow[]>();
  previewWords = output<WordsTableRow[]>();
  copyWords = output<WordsTableRow[]>();
  selectGroup = output<string>();

  readonly defaultOptionValue = DefaultOptionValueEnum.ALL;
  private readonly selectedGroupModel = linkedSignal<string>(
    () => this.selectedGroupId() ?? this.defaultOptionValue,
  );
  readonly selectedGroupField: Field<string> = form(this.selectedGroupModel);
  selectedWords: WordsTableRow[] = [];
}
