import { Router } from 'express';
import Repo from '../models/Repo';
import Authify from 'authifyjs';

const routes = Router();

routes.get('/:repoId', Authify.ensureAuth, async (req, res, next) => {
  const { repoId } = req.params;
  if (!repoId) {
    return next('Specify a repository ID!');
  }
  const repo = await Repo.findOne({ repoId });
  res.json(repo);
});

export default routes;
