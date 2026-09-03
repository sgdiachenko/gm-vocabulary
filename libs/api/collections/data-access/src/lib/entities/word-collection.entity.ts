import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WordCollectionDocument = HydratedDocument<WordCollection>;

@Schema({
  collection: 'wordgroups',
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class WordCollection {
  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: Boolean, default: false })
  isShared!: boolean;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId!: Types.ObjectId;
}

export const WordCollectionSchema = SchemaFactory.createForClass(WordCollection);

WordCollectionSchema.virtual('words', {
  ref: 'Word',
  localField: '_id',
  foreignField: 'groupId',
});
