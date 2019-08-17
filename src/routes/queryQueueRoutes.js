import { Router } from 'express';
import QueryQueue from '../models/QueryQueue';

const routes = Router();

routes.post('/add/repos', async (req, res, next) => {
  const { query, pages } = req.body;
  if (!query) {
    return next('Specify a query!');
  }

  for (let i = 1; i < 20; i++) {
    await QueryQueue.findOneAndUpdate(
      { query, type: 'repos' },
      { query, type: 'repos', pages },
      { new: true, upsert: true }
    );
  }

  res.json({
    query,
    message: 'Added to queue!'
  });
});

routes.post('/add/users', async (req, res, next) => {
  const { query, pages } = req.body;
  if (!query) {
    return next('Specify a query!');
  }

  for (let i = 1; i < 20; i++) {
    await QueryQueue.findOneAndUpdate(
      { query, type: 'users' },
      { query, type: 'users', pages },
      { new: true, upsert: true }
    );
  }

  res.json({
    query,
    message: 'Added to queue!'
  });
});

export default routes;
