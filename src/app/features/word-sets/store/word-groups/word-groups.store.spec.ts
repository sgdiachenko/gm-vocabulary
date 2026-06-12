import { TestBed } from '@angular/core/testing';

import { WordGroupParameterEnum } from '../../enums/word-group.parameter.enum';
import { WordGroupsStore, initialState } from './word-groups.store';
import { WordGroup } from '../../interfaces/word-group';

describe('WordGroupsStore', () => {
  let store: InstanceType<typeof WordGroupsStore>;
  const groups: WordGroup[] = [
    { _id: '1', name: 'Animals', isShared: false },
    { _id: '2', name: 'Food', isShared: true },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(WordGroupsStore);
    store.resetStore();
  });

  it('should expose initial state', () => {
    expect(store.groups()).toEqual(initialState.groups);
    expect(store.sharedGroups()).toEqual(initialState.sharedGroups);
  });

  it('should add, update, and delete user groups', () => {
    store.addGroups(groups);
    store.updateGroup({ ...groups[0], [WordGroupParameterEnum.NAME]: 'Pets' });
    store.deleteGroup('2');

    expect(store.groups()).toEqual([
      { _id: '1', name: 'Pets', isShared: false },
    ]);
  });

  it('should add shared groups', () => {
    store.addSharedGroups([groups[1]]);

    expect(store.sharedGroups()).toEqual([groups[1]]);
  });

  it('should reset store state', () => {
    store.addGroups(groups);
    store.addSharedGroups([groups[1]]);

    store.resetStore();

    expect(store.groups()).toEqual(initialState.groups);
    expect(store.sharedGroups()).toEqual(initialState.sharedGroups);
  });
});
