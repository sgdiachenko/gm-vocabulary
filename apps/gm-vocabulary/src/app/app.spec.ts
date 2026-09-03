import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AuthService } from '@gm-vocabulary/auth/data-access';

describe('App', () => {
  beforeEach(async () => {
    const mockAuthService = {
      autoAuthUser: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
