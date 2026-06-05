import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleCollectionPageComponent } from './single-collection-page.component';

describe('SingleCollectionPageComponent', () => {
  let component: SingleCollectionPageComponent;
  let fixture: ComponentFixture<SingleCollectionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleCollectionPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleCollectionPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
