import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWordDto {
  @IsString()
  @IsNotEmpty()
  word!: string;

  @IsString()
  @IsNotEmpty()
  translation!: string;

  @IsOptional()
  @IsMongoId()
  groupId?: string | null;
}
