import { WordParameterDisplayNameEnum } from '@gm-vocabulary/vocabulary/util';
import { TableColumn } from '@gm-vocabulary/shared/ui';
import { WordParameterEnum } from '@gm-vocabulary/vocabulary/util';

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
