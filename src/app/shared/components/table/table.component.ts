import { Component, effect, input, output } from '@angular/core';
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
  selectionKey = input<string>('_id');
  selectionChange = output<any[]>();

  selection = new SelectionModel<any>(
    true,
    [],
    true,
    (firstRow, secondRow) => this.getSelectionValue(firstRow) === this.getSelectionValue(secondRow)
  );

  private readonly reconcileSelection = effect(() => {
    const rows = this.dataSource();
    const selectedRows = this.selection.selected;

    if (selectedRows.length === 0) {
      return;
    }

    const currentSelection = rows.filter(row => this.selection.isSelected(row));
    const selectionChanged = currentSelection.length !== selectedRows.length
      || currentSelection.some((row, index) => row !== selectedRows[index]);

    if (selectionChanged) {
      this.selection.clear();
      this.selection.select(...currentSelection);
      this.selectionChange.emit(currentSelection);
    }
  });

  get columnsNames(){
    return [
      ...(this.allowEdit() ? ['select'] : []),
      ...(this.columns()?.map(({name}) => name) || [])
    ];
  };

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

  private getSelectionValue(row: any): unknown {
    return row?.[this.selectionKey()] ?? row;
  }
}
