import { WordParameterEnum } from '@gm-vocabulary/vocabulary/util';
import { Word } from '@gm-vocabulary/vocabulary/util';

export interface WordsTableRow extends Word, Record<string, string | number | undefined> {
  [WordParameterEnum.GROUP_NAME]?: string;
}
