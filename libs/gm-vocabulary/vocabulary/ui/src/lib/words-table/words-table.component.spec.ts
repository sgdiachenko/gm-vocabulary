import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordsTableComponent } from './words-table.component';

describe('WordsTableComponent', () => {
  let component: WordsTableComponent;
  let fixture: ComponentFixture<WordsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordsTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WordsTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
