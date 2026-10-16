import { WordGroupParameterEnum } from './word-group.parameter.enum';
import { WordGroupRequest } from './word-group-request';
import { Word } from '../../words/contracts/word';

export interface WordGroup extends WordGroupRequest {
  [WordGroupParameterEnum.ID]: string;
  [WordGroupParameterEnum.WORDS]?: Word[];
}
