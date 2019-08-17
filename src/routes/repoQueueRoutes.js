import { Router } from 'express';
import RepoQueue from '../models/RepoQueue';

import Authify from 'authifyjs';

const routes = Router();

routes.post('/add', Authify.ensureAuth, async (req, res, next) => {
  const { fullName } = req.body;
  if (!fullName) {
    return next('Specify a repository full name!');
  }

  await RepoQueue.findOneAndUpdate({ fullName }, { fullName }, { new: true, upsert: true });

  res.json({
    fullName,
    message: 'Added to queue!'
  });
});

export default routes;
