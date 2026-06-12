import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { firstValueFrom, of, throwError } from 'rxjs';

import { WordGroupParameterEnum } from '../../enums/word-group.parameter.enum';
import { WordGroupsApiService } from '../word-groups-api/word-groups-api.service';
import { WordGroupsStore } from '../../store/word-groups/word-groups.store';
import { WordGroupService } from './word-group.service';
import { WordGroup } from '../../interfaces/word-group';

describe('WordGroupService', () => {
  let service: WordGroupService;
  let store: InstanceType<typeof WordGroupsStore>;
  let mockWordGroupsApiService: {
    getUserGroups: ReturnType<typeof vi.fn>;
    getSharedGroups: ReturnType<typeof vi.fn>;
    getGroup: ReturnType<typeof vi.fn>;
    addGroup: ReturnType<typeof vi.fn>;
    addGroupSet: ReturnType<typeof vi.fn>;
    updateGroup: ReturnType<typeof vi.fn>;
    deleteGroup: ReturnType<typeof vi.fn>;
  };

  const groups: WordGroup[] = [
    { _id: '1', name: 'Animals', isShared: false },
    { _id: '2', name: 'Food', isShared: true },
  ];

  beforeEach(() => {
    mockWordGroupsApiService = {
      getUserGroups: vi.fn(),
      getSharedGroups: vi.fn(),
      getGroup: vi.fn(),
      addGroup: vi.fn(),
      addGroupSet: vi.fn(),
      updateGroup: vi.fn(),
      deleteGroup: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        WordGroupService,
        { provide: WordGroupsApiService, useValue: mockWordGroupsApiService },
      ],
    });

    service = TestBed.inject(WordGroupService);
    store = TestBed.inject(WordGroupsStore);
    store.resetStore();
  });

  it('should fetch user groups and add them to the store', async () => {
    mockWordGroupsApiService.getUserGroups.mockReturnValue(of(groups));

    const result = await firstValueFrom(service.getUserGroups());

    expect(result).toEqual(groups);
    expect(service.groups()).toEqual(groups);
    expect(service.fetchIsLoading()).toBe(false);
    expect(service.fetchError()).toBeNull();
  });

  it('should fetch shared groups and add them to the store', async () => {
    mockWordGroupsApiService.getSharedGroups.mockReturnValue(of([groups[1]]));

    await firstValueFrom(service.getSharedGroups());

    expect(service.sharedGroups()).toEqual([groups[1]]);
    expect(service.fetchIsLoading()).toBe(false);
  });

  it('should add and update groups', async () => {
    mockWordGroupsApiService.addGroup.mockReturnValue(of(groups[0]));
    mockWordGroupsApiService.updateGroup.mockReturnValue(of(void 0));

    await firstValueFrom(service.addGroup({ name: 'Animals', isShared: false }));
    await firstValueFrom(service.updateGroup('1', { name: 'Pets', isShared: false }));

    expect(service.groups()).toEqual([
      { _id: '1', name: 'Pets', isShared: false },
    ]);
    expect(service.updateIsLoading()).toBe(false);
    expect(service.updateError()).toBeNull();
  });

  it('should delete groups from the store', async () => {
    store.addGroups(groups);
    mockWordGroupsApiService.deleteGroup.mockReturnValue(of(void 0));

    await firstValueFrom(service.deleteGroup('1'));

    expect(service.groups()).toEqual([groups[1]]);
    expect(service.deleteIsLoading()).toBe(false);
    expect(service.deleteError()).toBeNull();
  });

  it('should compute group names and select options', () => {
    store.addGroups(groups);

    expect(service.getGroupNameById(signal('1'))()).toBe('Animals');
    expect(service.getWordGroupOptions()).toEqual([
      { id: '1', name: 'Animals' },
      { id: '2', name: 'Food' },
    ]);
  });

  it('should expose request errors', async () => {
    const error = { error: { message: 'Could not add group' } };
    mockWordGroupsApiService.addGroup.mockReturnValue(throwError(() => error));

    await expect(firstValueFrom(service.addGroup({ name: 'Animals' }))).rejects.toBe(error);

    expect(service.updateIsLoading()).toBe(false);
    expect(service.updateError()?.message).toBe('Could not add group');
  });
});
