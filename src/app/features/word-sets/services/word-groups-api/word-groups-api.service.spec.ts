import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../../environments/environment';
import { WordGroupsApiService } from './word-groups-api.service';

describe('WordGroupsApiService', () => {
  let service: WordGroupsApiService;
  let httpTestingController: HttpTestingController;
  const baseUrl = `${environment.vocabularyApiUrl}/collections`;
  const group = {
    _id: '1',
    name: 'Animals',
    isShared: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WordGroupsApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(WordGroupsApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should get user groups', () => {
    service.getUserGroups().subscribe(response => {
      expect(response).toEqual([group]);
    });

    const req = httpTestingController.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');

    req.flush([group]);
  });

  it('should get shared groups', () => {
    service.getSharedGroups().subscribe(response => {
      expect(response).toEqual([group]);
    });

    const req = httpTestingController.expectOne(`${baseUrl}/shared`);
    expect(req.request.method).toBe('GET');

    req.flush([group]);
  });

  it('should get a group by id', () => {
    service.getGroup('1').subscribe(response => {
      expect(response).toEqual(group);
    });

    const req = httpTestingController.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');

    req.flush(group);
  });

  it('should add a group', () => {
    const request = { name: 'Animals', isShared: false };

    service.addGroup(request).subscribe(response => {
      expect(response).toEqual(group);
    });

    const req = httpTestingController.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);

    req.flush(group);
  });

  it('should add a group set', () => {
    const request = [{ name: 'Animals' }, { name: 'Food' }];

    service.addGroupSet(request).subscribe(response => {
      expect(response).toEqual([group]);
    });

    const req = httpTestingController.expectOne(`${baseUrl}/bulk`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);

    req.flush([group]);
  });

  it('should update a group', () => {
    const request = { name: 'Pets', isShared: true };

    service.updateGroup('1', request).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpTestingController.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);

    req.flush(null);
  });

  it('should delete a group', () => {
    service.deleteGroup('1').subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpTestingController.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');

    req.flush(null);
  });
});
