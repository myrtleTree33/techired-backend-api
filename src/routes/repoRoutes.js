import { Router } from 'express';
import Authify from 'authifyjs';

import Repo from '../models/Repo';

const routes = Router();

const getRepo = async (req, res, next) => {
  const { repoId } = req.params;

  if (!repoId) {
    return next('Specify a repository ID!');
  }

  const repo = await Repo.findOne({ repoId });
  return res.json(repo);
};

routes.get('/:repoId', Authify.ensureAuth, getRepo);

export default routes;
