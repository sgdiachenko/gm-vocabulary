import { HttpErrorResponse } from '@angular/common/http';

import { getErrorMessage } from './get-error-message.util';

describe('getErrorMessage', () => {
  it('should return a valid string message', () => {
    expect(getErrorMessage(createError({ message: 'Request failed' }))).toBe('Request failed');
  });

  it('should preserve valid messages and discard malformed array items', () => {
    const error = createError({
      message: ['Password is too short', null, {}, '', 'Password must contain a number'],
    });

    expect(getErrorMessage(error)).toEqual([
      'Password is too short',
      'Password must contain a number',
    ]);
  });

  it.each([{}, { message: '   ' }])(
    'should return the HTTP error message when the API message is unavailable',
    (payload) => {
      const error = createError(payload);
      expect(getErrorMessage(error)).toBe(error.message);
    },
  );

  it.each([{ message: [] }, { message: [null, {}, ''] }])(
    'should return a fallback when an API message array contains no valid messages',
    (payload) => {
      expect(getErrorMessage(createError(payload))).toBe('An unknown error occurred');
    },
  );

  function createError(error: unknown): HttpErrorResponse {
    return new HttpErrorResponse({
      error,
      status: 400,
      statusText: 'Bad Request',
      url: '/api/test',
    });
  }
});
