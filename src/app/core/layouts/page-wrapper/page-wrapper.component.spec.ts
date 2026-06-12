import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { PageWrapperComponent } from './page-wrapper.component';
import { AuthService } from '../../../features/auth/services/auth/auth.service';

describe('PageWrapperComponent', () => {
  let component: PageWrapperComponent;
  let fixture: ComponentFixture<PageWrapperComponent>;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      authLoadingState: signal(false),
      logout: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [PageWrapperComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageWrapperComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
