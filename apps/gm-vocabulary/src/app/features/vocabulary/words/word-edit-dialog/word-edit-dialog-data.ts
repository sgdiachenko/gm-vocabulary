import { SelectOption } from '../../../../shared/forms/select-option';
import { Word } from '../contracts/word';

export interface WordEditDialogData extends Partial<Word> {
  wordGroups: SelectOption[];
  disableGroupSelection?: boolean;
}
