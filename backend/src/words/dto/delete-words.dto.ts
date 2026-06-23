import { ArrayNotEmpty, IsArray, IsMongoId } from 'class-validator';

export class DeleteWordsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  ids!: string[];
}
