import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { PageWrapperComponent } from './page-wrapper.component';
import { AuthService } from '@gm-vocabulary/auth/data-access';

describe('PageWrapperComponent', () => {
  let component: PageWrapperComponent;
  let fixture: ComponentFixture<PageWrapperComponent>;

  beforeEach(async () => {
    const mockAuthService = {
      authLoadingState: signal(false),
      logout: vi.fn(),
      username: signal('Test User'),
    };

    await TestBed.configureTestingModule({
      imports: [PageWrapperComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: mockAuthService }],
    }).compileComponents();

    fixture = TestBed.createComponent(PageWrapperComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should display the username beside logout', () => {
    expect(fixture.nativeElement.querySelector('mat-toolbar').textContent).toContain('Test User');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
