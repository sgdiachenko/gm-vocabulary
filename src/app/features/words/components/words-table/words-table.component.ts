import { Component, input, linkedSignal, output } from '@angular/core';
import { Field, form } from '@angular/forms/signals';

import { SelectComponent } from '../../../../shared/components/form-fields/select/select.component';
import { ButtonComponent } from "../../../../shared/components/button/button.component";
import { TableComponent } from "../../../../shared/components/table/table.component";
import { DefaultOptionValueEnum } from '../../../../shared/enums/default-option-value.enum';
import { TableColumn } from '../../../../shared/components/table/table-column';
import { SelectOption } from '../../../../shared/interfaces/select-option';
import { WordsTableRow } from './words-table-row';

@Component({
  selector: 'gm-words-table',
  imports: [
    ButtonComponent,
    TableComponent,
    SelectComponent
  ],
  templateUrl: './words-table.component.html',
  styleUrl: './words-table.component.scss',
})
export class WordsTableComponent {

  dataSource = input<WordsTableRow[]>([]);
  groups = input<SelectOption[]>([]);
  selectedGroupId = input<string | null>(null);
  allowEdit = input<boolean>(true);
  allowSwitchGroup = input<boolean>(true);
  columns = input<TableColumn[]>([]);

  addWord = output();
  editWord = output<WordsTableRow>();
  deleteWords = output<WordsTableRow[]>();
  selectGroup = output<string>();

  readonly defaultOptionValue = DefaultOptionValueEnum.ALL;
  private readonly selectedGroupModel = linkedSignal<string>(() => this.selectedGroupId() ?? this.defaultOptionValue);
  readonly selectedGroupField: Field<string> = form(this.selectedGroupModel);
  selectedWords: WordsTableRow[];
}
