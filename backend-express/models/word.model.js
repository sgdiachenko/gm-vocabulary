import mongoose from 'mongoose';

const WordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  translation: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WordGroup',
    default: null
  }
});

export default mongoose.model('Word', WordSchema);
