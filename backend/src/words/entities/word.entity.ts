import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WordDocument = HydratedDocument<Word>;

@Schema()
export class Word {
  @Prop({ required: true })
  word!: string;

  @Prop({ required: true })
  translation!: string;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'WordCollection', default: null })
  groupId!: Types.ObjectId | null;
}

export const WordSchema = SchemaFactory.createForClass(Word);
