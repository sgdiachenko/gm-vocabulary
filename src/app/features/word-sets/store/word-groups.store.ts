import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import { WordGroupParameterEnum } from '../enums/word-group.parameter.enum';
import { WordGroup } from '../interfaces/word-group';

export interface WordGroupsState {
  groups: WordGroup[];
  sharedGroups: WordGroup[];
}

export const initialState: WordGroupsState = {
  groups: [],
  sharedGroups: []
}

export const WordGroupsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(store => ({
    addGroups(groups: WordGroup[]) {
      patchState(store, {
        groups: [...store.groups(), ...groups]
      })
    },
    addGroup(group: WordGroup) {
      patchState(store, {
        groups: [...store.groups(), group]
      })
    },
    addSharedGroups(groups: WordGroup[]) {
      patchState(store, {
        sharedGroups: [...store.sharedGroups(), ...groups]
      })
    },
    updateGroup(group: WordGroup) {
      patchState(store, {
        groups: store.groups().map(storeGroup => {
          if (storeGroup[WordGroupParameterEnum.ID] === group[WordGroupParameterEnum.ID]) {
            return { ...storeGroup, ...group };
          }
          return storeGroup;
        })
      })
    },
    deleteGroup(id: string) {
      patchState(store, {
        groups: store.groups().filter(storeGroup => storeGroup[WordGroupParameterEnum.ID] !== id)
      })
    },
    resetStore() {
      patchState(store, initialState)
    }
  }))
);
