import { WordParameterDisplayNameEnum } from '../contracts/word-parameter-display-name.enum';
import { TableColumn } from '../../../../shared/ui/table/table-column';
import { WordParameterEnum } from '../contracts/word.parameter.enum';

export const WordsTableColumns: TableColumn[] = [
  {
    name: WordParameterEnum.WORD,
    displayName: WordParameterDisplayNameEnum.WORD,
  },
  {
    name: WordParameterEnum.TRANSLATION,
    displayName: WordParameterDisplayNameEnum.TRANSLATION,
  },
  {
    name: WordParameterEnum.DESCRIPTION,
    displayName: WordParameterDisplayNameEnum.DESCRIPTION,
    minWidth: 240,
  },
  {
    name: WordParameterEnum.GROUP_NAME,
    displayName: WordParameterDisplayNameEnum.WORD_GROUP,
  },
];
