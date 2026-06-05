import { WordParameterEnum } from '../../enums/word.parameter.enum';
import { Word } from '../../interfaces/word';

export interface WordsTableRow extends Word {
  [WordParameterEnum.GROUP_NAME]: string
}
