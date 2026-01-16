import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionEditDialogComponent } from './collection-edit-dialog.component';

describe('CollectionEditDialogComponent', () => {
  let component: CollectionEditDialogComponent;
  let fixture: ComponentFixture<CollectionEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionEditDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionEditDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
