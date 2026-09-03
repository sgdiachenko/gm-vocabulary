import { WordParameterEnum } from '@gm-vocabulary/vocabulary/util';

export interface WordForm {
  [WordParameterEnum.WORD]: string;
  [WordParameterEnum.TRANSLATION]: string;
  [WordParameterEnum.DESCRIPTION]: string;
  [WordParameterEnum.GROUP_ID]: string;
}
