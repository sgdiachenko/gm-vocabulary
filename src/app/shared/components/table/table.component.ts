import { Component, input, output } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';

import { TableColumn } from './table-column';
import { Checkbox } from '../form-fields/checkbox/checkbox';

@Component({
  selector: 'gm-table',
  imports: [
    MatTable,
    MatHeaderCell,
    MatCell,
    MatColumnDef,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    Checkbox,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent {
  columns = input<TableColumn[]>([]);
  dataSource = input<any[]>([]);
  allowEdit = input<boolean>(true);
  selectionChange = output<any[]>();

  get columnsNames(){
    return [
      ...(this.allowEdit() ? ['select'] : []),
      ...(this.columns()?.map(({name}) => name) || [])
    ];
  };

  selection = new SelectionModel<any>(true, []);

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource().length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.selectionChange.emit(this.selection.selected);
      return;
    }

    this.selection.select(...this.dataSource());
    this.selectionChange.emit(this.selection.selected);
  }

  toggleRow(row: any) {
    this.selection.toggle(row);
    this.selectionChange.emit(this.selection.selected);
  }
}
