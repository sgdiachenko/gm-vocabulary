import { computed, Service, Signal } from '@angular/core';

import { WordGroupParameterEnum } from '../../word-sets/enums/word-group.parameter.enum';
import { WordsTableRow } from '../components/words-table/words-table-row';
import { WordGroup } from '../../word-sets/interfaces/word-group';
import { WordParameterEnum } from '../enums/word.parameter.enum';
import { Word } from '../interfaces/word';


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
