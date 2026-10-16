import { computed, Service, Signal } from '@angular/core';

import { WordGroupParameterEnum } from '../../collections/contracts/word-group.parameter.enum';
import { WordsTableRow } from './words-table-row';
import { WordGroup } from '../../collections/contracts/word-group';
import { WordParameterEnum } from '../contracts/word.parameter.enum';
import { Word } from '../contracts/word';

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
