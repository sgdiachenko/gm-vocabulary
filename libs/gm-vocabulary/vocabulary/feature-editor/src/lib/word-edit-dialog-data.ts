import { SelectOption } from '@gm-vocabulary/shared/util';
import { Word } from '@gm-vocabulary/vocabulary/util';

export interface WordEditDialogData extends Partial<Word> {
  wordGroups: SelectOption[];
  disableGroupSelection?: boolean;
}
