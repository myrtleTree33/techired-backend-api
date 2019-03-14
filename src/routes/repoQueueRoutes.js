import { Router } from 'express';
import { ensureAuth } from '../utils/socialAuth';
import RepoQueue from '../models/RepoQueue';

const routes = Router();

routes.post('/add', async (req, res, next) => {
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
