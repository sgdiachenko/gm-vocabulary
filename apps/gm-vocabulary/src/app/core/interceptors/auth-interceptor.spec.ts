import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from '../../features/auth/services/auth/auth.service';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authService: {
    token: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authService = {
      token: vi.fn(() => 'stored-token'),
      logout: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should add the stored token to outgoing requests', () => {
    httpClient.get('/api/words').subscribe();

    const request = httpTestingController.expectOne('/api/words');
    expect(request.request.headers.get('Authorization')).toBe('Bearer stored-token');
    request.flush([]);
  });

  it('should logout when the backend rejects a stored token', () => {
    httpClient.get('/api/words').subscribe({ error: () => undefined });

    const request = httpTestingController.expectOne('/api/words');
    request.flush(
      { message: 'Authentication failed' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(authService.logout).toHaveBeenCalledOnce();
  });

  it('should not add an authorization header without a token', () => {
    authService.token.mockReturnValue(null);
    httpClient.get('/api/words').subscribe();

    const request = httpTestingController.expectOne('/api/words');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush([]);
  });
});
