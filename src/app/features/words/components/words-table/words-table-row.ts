import { WordParameterEnum } from '../../enums/word.parameter.enum';
import { Word } from '../../interfaces/word';

export interface WordsTableRow extends Word, Record<string, string | number | undefined> {
  [WordParameterEnum.GROUP_NAME]: string
}
