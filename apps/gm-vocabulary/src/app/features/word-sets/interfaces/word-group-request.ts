import { WordGroupParameterEnum } from '../enums/word-group.parameter.enum';

export interface WordGroupRequest {
  [WordGroupParameterEnum.NAME]: string;
  [WordGroupParameterEnum.IS_SHARED]?: boolean;
  [WordGroupParameterEnum.USER_ID]?: string;
}
