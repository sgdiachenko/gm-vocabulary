import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { DefaultOptionValueEnum } from '../../../../shared/enums/default-option-value.enum';
import { WordParameterEnum } from '../../enums/word.parameter.enum';
import { Word } from '../../interfaces/word';

export interface WordsState {
  words: Word[];
  queryString: string;
  groupId: string;
}

export const initialState: WordsState = {
  words: [],
  queryString: '',
  groupId: DefaultOptionValueEnum.ALL
}

export const WordsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(store => ({
    filteredWords: () => {
      const groupId = store.groupId();
      const queryString = store.queryString().toLowerCase();

      return store.words().filter(storeWord => {
        const hasValidGroupId = groupId == null || groupId === DefaultOptionValueEnum.ALL
          || storeWord[WordParameterEnum.GROUP_ID]?.includes(groupId);

        const hasValidNameOrTranslation = queryString == null || queryString === ''
          || storeWord[WordParameterEnum.WORD].toLowerCase().includes(queryString)
          || storeWord[WordParameterEnum.TRANSLATION].toLowerCase().includes(queryString);

        return hasValidGroupId && hasValidNameOrTranslation;
      });
    }
  })),
  withMethods(store => ({
    addWords(words: Word[]) {
      patchState(store, {
        words: [...store.words(), ...words]
      })
    },
    addWord(word: Word) {
      patchState(store, {
        words: [...store.words(), word]
      })
    },
    updateWord(word: Word) {
      patchState(store, {
        words: store.words().map(storeWord => {
          if (storeWord[WordParameterEnum.ID] === word[WordParameterEnum.ID]) {
            return { ...storeWord, ...word };
          }
          return storeWord;
        })
      })
    },
    deleteWords(ids: string[]) {
      patchState(store, {
        words: store.words().filter(storeWord => !ids.includes(storeWord[WordParameterEnum.ID]))
      })
    },
    filterByGroupId(id: string) {
      patchState(store, {
        groupId: id
      })
    },
    resetStore() {
      patchState(store, initialState)
    }
  }))
);
