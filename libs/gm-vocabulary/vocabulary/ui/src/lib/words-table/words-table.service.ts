import { computed, Service, Signal } from '@angular/core';

import { WordGroupParameterEnum } from '@gm-vocabulary/collections/util';
import { WordsTableRow } from './words-table-row';
import { WordGroup } from '@gm-vocabulary/collections/util';
import { WordParameterEnum } from '@gm-vocabulary/vocabulary/util';
import { Word } from '@gm-vocabulary/vocabulary/util';

@Service()
export class WordsTableService {
  getTableData(words: Signal<Word[]>, groups: Signal<WordGroup[]>): Signal<WordsTableRow[]> {
    return computed(() => {
      return words()?.map((word) => {
        return {
          ...word,
          [WordParameterEnum.GROUP_NAME]: groups()?.find(
            (group) => group[WordGroupParameterEnum.ID] === word[WordParameterEnum.GROUP_ID],
          )?.[WordGroupParameterEnum.NAME],
        };
      });
    });
  }
}
