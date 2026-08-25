import { SelectOption } from '../../../../shared/interfaces/select-option';
import { Word } from '../../interfaces/word';

export interface WordEditDialogData extends Partial<Word> {
  wordGroups: SelectOption[];
  disableGroupSelection?: boolean;
}
