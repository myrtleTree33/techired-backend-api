import { Router } from 'express';
import { ensureAuth } from '../utils/socialAuth';
import QueryQueue from '../models/QueryQueue';

const routes = Router();

routes.post('/add', async (req, res, next) => {
  const { query, pages } = req.body;
  if (!query) {
    return next('Specify a query!');
  }

  for (let i = 1; i < 20; i++) {
    await QueryQueue.findOneAndUpdate({ query }, { query, pages }, { new: true, upsert: true });
  }

  res.json({
    query,
    message: 'Added to queue!'
  });
});

export default routes;
