import { Router } from 'express';
import QueryQueue from '../models/QueryQueue';

const routes = Router();

const addQueryRepos = async (req, res, next) => {
  const { query, pages } = req.body;

  if (!query) {
    return next('Specify a query!');
  }

  const queuePromises = [];

  for (let i = 1; i < 20; i++) {
    queuePromises.push(
      QueryQueue.findOneAndUpdate(
        { query, type: 'repos' },
        { query, type: 'repos', pages },
        { new: true, upsert: true }
      )
    );
  }

  await Promise.all(queuePromises);
  return res.json({ query, message: 'Added to queue!' });
};

const addQueryUsers = async (req, res, next) => {
  const { query, pages } = req.body;

  if (!query) {
    return next('Specify a query!');
  }

  const queuePromises = [];

  // Add to promise queue
  for (let i = 1; i < 20; i++) {
    queuePromises.push(
      QueryQueue.findOneAndUpdate(
        { query, type: 'users' },
        { query, type: 'users', pages },
        { new: true, upsert: true }
      )
    );
  }

  await Promise.all(queuePromises);
  return res.json({ query, message: 'Added to queue!' });
};

// Routes
routes.post('/add/repos', addQueryRepos);
routes.post('/add/users', addQueryUsers);

export default routes;
