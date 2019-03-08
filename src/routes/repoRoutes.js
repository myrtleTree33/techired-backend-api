import { Router } from 'express';
import { ensureAuth } from '../utils/socialAuth';
import Repo from '../models/Repo';

const routes = Router();

routes.get('/:repoId', async (req, res, next) => {
  const { repoId } = req.params;
  if (!repoId) {
    return next('Specify a repository ID!');
  }
  const repo = await Repo.findOne({ repoId });
  res.json(repo);
});

export default routes;
