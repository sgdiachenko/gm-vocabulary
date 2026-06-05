import { WordParameterEnum } from "../enums/word.parameter.enum";

export interface WordRequest {
  [WordParameterEnum.WORD]: string;
  [WordParameterEnum.TRANSLATION]: string;
  [WordParameterEnum.GROUP_ID]: string;
}
