import { Router } from 'express';
import { HttpError, objectId } from './http.js';
import { collectionInput, collectionsInput } from './validation.js';

export function collectionRoutes({ WordCollection }, requireAuth) {
  const router = Router();
  router.use(requireAuth);

  router.post('/', async (request, response) => {
    const input = collectionInput(request.body);
    const collection = await WordCollection.create({ ...input, userId: objectId(request.user.id) });
    return response.status(201).json(collection);
  });

  router.get('/', async (request, response) => {
    const collections = await WordCollection.find({ userId: objectId(request.user.id) })
      .populate('words').exec();
    return response.json(collections);
  });

  router.get('/shared', async (request, response) => {
    const collections = await WordCollection.find({
      isShared: true,
      userId: { $ne: objectId(request.user.id) },
    }).populate('words').exec();
    return response.json(collections);
  });

  router.get('/:id', async (request, response) => {
    const id = objectId(request.params.id);
    const collection = await WordCollection.findOne({
      _id: id,
      $or: [{ userId: objectId(request.user.id) }, { isShared: true }],
    }).populate('words').exec();
    if (!collection) throw new HttpError(404, 'Collection not found');
    return response.json(collection);
  });

  router.post('/bulk', async (request, response) => {
    const inputs = collectionsInput(request.body);
    const collections = await WordCollection.insertMany(
      inputs.map((input) => ({ ...input, userId: objectId(request.user.id) })),
    );
    return response.status(201).json(collections);
  });

  router.put('/:id', async (request, response) => {
    const id = objectId(request.params.id);
    const input = collectionInput(request.body, true);
    const result = await WordCollection.updateOne(
      { _id: id, userId: objectId(request.user.id) }, input,
    ).exec();
    if (result.matchedCount === 0) throw new HttpError(404, 'Collection not found');
    return response.status(200).send();
  });

  router.delete('/:id', async (request, response) => {
    const id = objectId(request.params.id);
    const result = await WordCollection.deleteOne({
      _id: id,
      userId: objectId(request.user.id),
    }).exec();
    if (result.deletedCount === 0) throw new HttpError(404, 'Collection not found');
    return response.status(200).send();
  });

  return router;
}
