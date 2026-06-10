import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';

import { ChipGridComponent } from './chip-grid.component';

describe('ChipGridComponent', () => {
  let component: ChipGridComponent;
  let fixture: ComponentFixture<ChipGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipGridComponent]
    })
    .overrideComponent(ChipGridComponent, {
      add: {
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChipGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
