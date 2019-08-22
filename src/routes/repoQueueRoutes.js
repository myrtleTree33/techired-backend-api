import { Router } from 'express';
import RepoQueue from '../models/RepoQueue';

import Authify from 'authifyjs';

const routes = Router();

const addRepoToQueue = async (req, res, next) => {
  const { fullName } = req.body;
  if (!fullName) {
    return next('Specify a repository full name!');
  }

  await RepoQueue.findOneAndUpdate({ fullName }, { fullName }, { new: true, upsert: true });

  return res.json({
    fullName,
    message: 'Added to queue!'
  });
};

// Routes
routes.post('/add', addRepoToQueue);

export default routes;
