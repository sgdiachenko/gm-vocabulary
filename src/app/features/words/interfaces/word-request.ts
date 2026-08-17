import { WordParameterEnum } from "../enums/word.parameter.enum";

export interface WordRequest {
  [WordParameterEnum.WORD]: string;
  [WordParameterEnum.TRANSLATION]?: string;
  [WordParameterEnum.DESCRIPTION]?: string;
  [WordParameterEnum.GROUP_ID]?: string;
}
