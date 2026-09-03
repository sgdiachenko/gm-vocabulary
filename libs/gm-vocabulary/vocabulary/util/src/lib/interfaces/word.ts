import { WordParameterEnum } from '../enums/word.parameter.enum';
import { WordRequest } from './word-request';

export interface Word extends WordRequest {
  [WordParameterEnum.ID]: string;
}
