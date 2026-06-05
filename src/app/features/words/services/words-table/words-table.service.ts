import { computed, Service, Signal } from '@angular/core';

import { WordGroupParameterEnum } from '../../../../enums/word-group.parameter.enum';
import { WordsTableRow } from '../../components/words-table/words-table-row';
import { WordParameterEnum } from '../../../../enums/word.parameter.enum';
import { WordGroup } from '../../../../interfaces/word-group';
import { Word } from '../../../../interfaces/word';

@Service()
export class WordsTableService {
  getTableData(words: Signal<Word[]>, groups: Signal<WordGroup[]>): Signal<WordsTableRow[]> {
    return computed(() => {
      return words()?.map(word => {
        return {
          ...word,
          [WordParameterEnum.GROUP_NAME]: groups()?.find(group => group[WordGroupParameterEnum.ID] === word[WordParameterEnum.GROUP_ID])?.[WordGroupParameterEnum.NAME]
        }
      });
    })
  }
}
