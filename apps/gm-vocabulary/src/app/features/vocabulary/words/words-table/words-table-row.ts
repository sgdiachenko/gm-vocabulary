import { WordParameterEnum } from '../contracts/word.parameter.enum';
import { Word } from '../contracts/word';

export interface WordsTableRow extends Word, Record<string, string | number | undefined> {
  [WordParameterEnum.GROUP_NAME]?: string;
}
