import { PartialType } from '@nestjs/mapped-types';
import { CreateWordCollectionDto } from './create-word-collection.dto';

export class UpdateWordCollectionDto extends PartialType(
  CreateWordCollectionDto,
) {}
