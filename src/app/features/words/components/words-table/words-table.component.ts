import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SelectComponent } from '../../../../shared/components/select/select.component';
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
    FormsModule,
    SelectComponent
  ],
  templateUrl: './words-table.component.html',
  styleUrl: './words-table.component.scss',
})
export class WordsTableComponent {

  dataSource = input<WordsTableRow[]>([]);
  groups = input<SelectOption[]>([]);
  selectedGroupId = input<string>(null);
  allowEdit = input<boolean>(true);
  allowSwitchGroup = input<boolean>(true);
  columns = input<TableColumn[]>([]);

  addWord = output();
  editWord = output<WordsTableRow>();
  deleteWords = output<WordsTableRow[]>();
  selectGroup = output<string>();

  readonly defaultOptionValue = DefaultOptionValueEnum.ALL;
  selectedWords: WordsTableRow[];
}
