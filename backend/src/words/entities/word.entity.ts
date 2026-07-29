import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WordDocument = HydratedDocument<Word>;

@Schema()
export class Word {
  @Prop({ required: true })
  word!: string;

  @Prop({ type: String, default: undefined })
  translation?: string;

  @Prop({ type: String, default: undefined })
  description!: string;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'WordCollection', default: undefined })
  groupId!: Types.ObjectId | undefined;
}

export const WordSchema = SchemaFactory.createForClass(Word);
