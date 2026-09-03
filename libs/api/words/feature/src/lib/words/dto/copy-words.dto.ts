import { ArrayNotEmpty, IsArray, IsMongoId } from 'class-validator';

export class CopyWordsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  ids!: string[];
}
