import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthPageContainer } from './auth-page.container';

describe('AuthPageContainer', () => {
  let component: AuthPageContainer;
  let fixture: ComponentFixture<AuthPageContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPageContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthPageContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
