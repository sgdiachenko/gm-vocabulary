import mongoose from 'mongoose';

const WordGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isShared: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }
});

WordGroupSchema.virtual('words', {
  ref: 'Word',
  localField: '_id',
  foreignField: 'groupId'
});

WordGroupSchema.set('toJSON', { virtuals: true });
WordGroupSchema.set('toObject', { virtuals: true });

export default mongoose.model('WordGroup', WordGroupSchema);
