import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWordCollectionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsBoolean()
  isShared?: boolean;
}
