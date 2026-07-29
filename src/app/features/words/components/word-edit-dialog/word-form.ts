import { WordParameterEnum } from '../../enums/word.parameter.enum';

export interface WordForm {
  [WordParameterEnum.WORD]: string;
  [WordParameterEnum.TRANSLATION]: string;
  [WordParameterEnum.DESCRIPTION]: string;
  [WordParameterEnum.GROUP_ID]: string;
}
