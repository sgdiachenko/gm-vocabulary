import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should include select column when editing is allowed', async () => {
    fixture.componentRef.setInput('columns', [
      { name: 'name', displayName: 'Name' },
      { name: 'translation', displayName: 'Translation' },
    ]);
    await fixture.whenStable();

    expect(component.columnsNames).toEqual(['select', 'name', 'translation']);
  });

  it('should omit select column when editing is not allowed', async () => {
    fixture.componentRef.setInput('allowEdit', false);
    fixture.componentRef.setInput('columns', [{ name: 'name', displayName: 'Name' }]);
    await fixture.whenStable();

    expect(component.columnsNames).toEqual(['name']);
  });

  it('should select all rows and emit selected rows', async () => {
    const selectionChangeSpy = vi.fn();
    const rows = [
      { id: '1', name: 'one' },
      { id: '2', name: 'two' },
    ];
    fixture.componentRef.setInput('dataSource', rows);
    component.selectionChange.subscribe(selectionChangeSpy);
    await fixture.whenStable();

    component.toggleAllRows();

    expect(component.selection.selected).toEqual(rows);
    expect(selectionChangeSpy).toHaveBeenCalledWith(rows);
  });

  it('should clear all rows when all rows are selected', async () => {
    const selectionChangeSpy = vi.fn();
    const rows = [
      { id: '1', name: 'one' },
      { id: '2', name: 'two' },
    ];
    fixture.componentRef.setInput('dataSource', rows);
    component.selection.select(...rows);
    component.selectionChange.subscribe(selectionChangeSpy);
    await fixture.whenStable();

    component.toggleAllRows();

    expect(component.selection.selected).toEqual([]);
    expect(selectionChangeSpy).toHaveBeenCalledWith([]);
  });

  it('should toggle a single row and emit current selection', () => {
    const selectionChangeSpy = vi.fn();
    const row = { id: '1', name: 'one' };
    component.selectionChange.subscribe(selectionChangeSpy);

    component.toggleRow(row);

    expect(component.selection.isSelected(row)).toBe(true);
    expect(selectionChangeSpy).toHaveBeenCalledWith([row]);

    component.toggleRow(row);

    expect(component.selection.isSelected(row)).toBe(false);
    expect(selectionChangeSpy).toHaveBeenCalledWith([]);
  });
});
