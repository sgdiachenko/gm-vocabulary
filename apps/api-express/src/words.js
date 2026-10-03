import { Router } from 'express';
import { Types } from 'mongoose';
import { HttpError, objectId } from './http.js';
import { idsInput, wordInput } from './validation.js';

export function wordRoutes({ Word, WordCollection }, requireAuth) {
  const router = Router();
  router.use(requireAuth);

  router.post('/', async (request, response) => {
    const input = wordInput(request.body);
    const word = await Word.create({
      ...input,
      groupId: input.groupId ? objectId(input.groupId) : undefined,
      userId: objectId(request.user.id),
    });
    return response.status(201).json(word);
  });

  router.get('/', async (request, response) => {
    const words = await Word.find({ userId: objectId(request.user.id) }).exec();
    return response.json(words);
  });

  router.post('/copy', async (request, response) => {
    const ids = idsInput(request.body);
    const ownerId = objectId(request.user.id);
    const sourceWords = await Word.find({ _id: { $in: ids.map(objectId) } }).lean().exec();
    const groupIds = sourceWords.flatMap((word) => (word.groupId ? [word.groupId] : []));
    const sharedCollections = await WordCollection.find({
      _id: { $in: groupIds },
      isShared: true,
      userId: { $ne: ownerId },
    }).select('_id').lean().exec();
    const sharedIds = new Set(sharedCollections.map((collection) => collection._id.toString()));
    const wordsToCopy = sourceWords.filter(
      (word) => word.groupId && sharedIds.has(word.groupId.toString()),
    );
    if (wordsToCopy.length !== ids.length) {
      throw new HttpError(404, 'One or more words not found');
    }
    const copied = await Word.insertMany(wordsToCopy.map(({ word, translation, description }) => ({
      word, translation, description, userId: ownerId,
    })));
    return response.status(201).json(copied);
  });

  router.put('/:id', async (request, response) => {
    const id = objectId(request.params.id);
    const input = wordInput(request.body, true);
    const update = {
      word: input.word,
      translation: input.translation,
      description: input.description,
      ...(input.groupId !== undefined && { groupId: input.groupId ? new Types.ObjectId(input.groupId) : undefined }),
    };
    const result = await Word.updateOne({ _id: id, userId: objectId(request.user.id) }, update).exec();
    if (result.matchedCount === 0) throw new HttpError(404, 'Word not found');
    return response.status(200).send();
  });

  router.delete('/', async (request, response) => {
    const ids = idsInput(request.body);
    const result = await Word.deleteMany({
      _id: { $in: ids.map(objectId) },
      userId: objectId(request.user.id),
    }).exec();
    return response.json({ message: 'Words deleted', deletedCount: result.deletedCount });
  });

  return router;
}
