import { WordParameterDisplayNameEnum } from '../../enums/word-parameter-display-name.enum';
import { TableColumn } from '../../../../shared/components/table/table-column';
import { WordParameterEnum } from '../../enums/word.parameter.enum';

export const WordsTableColumns: TableColumn[] = [
  {
    name: WordParameterEnum.WORD,
    displayName: WordParameterDisplayNameEnum.WORD
  },
  {
    name: WordParameterEnum.TRANSLATION,
    displayName: WordParameterDisplayNameEnum.TRANSLATION
  },
  {
    name: WordParameterEnum.GROUP_NAME,
    displayName: WordParameterDisplayNameEnum.WORD_GROUP
  }
];
