import { Router } from 'express';
import Authify from 'authifyjs';

import logger from '../logger';

import Profile from '../models/Profile';
import Repo from '../models/Repo';

const PER_PAGE = parseInt(process.env.PER_PAGE, 10);

const routes = Router();

const compose = (...fns) => args => fns.reduceRight((x, f) => f(x), args);
const minBound = min => n => Math.min(n, min);
const maxBound = max => n => Math.max(n, max);

const bounds = (min, max, n) =>
  compose(
    minBound(max),
    maxBound(min)
  )(n);

const viewProfile = async (req, res, next) => {
  const { login } = req.params;
  if (!login) {
    return next('Specify a user!');
  }
  const profile = await Profile.findOne({ login });
  return res.json(profile);
};

const addProfile = async (req, res, next) => {
  const { login } = req.params;

  let depth = parseInt(req.query.depth || 1, 10);
  depth = bounds(0, 99, depth);

  if (!login) {
    return next('Specify a user!');
  }
  try {
    await Profile.findOneAndUpdate(
      { login: login.toLowerCase() },
      { login: login.toLowerCase(), depth, lastScrapedAt: new Date(0) },
      { upsert: true, new: true }
    );
    return res.json({ message: 'Saved user successfully!' });
  } catch (e) {
    logger.error(e.message);
    return next({ message: 'Error saving user.' });
  }
};

/**
 * Retrieves all repos belonging to a certain user.
 */
const viewProfileRepos = async (req, res, next) => {
  const page = parseInt(req.query.page || 1, 10);
  const { login } = req.params;

  if (!login) {
    return next('Specify a user!');
  }

  const pagination = {
    limit: PER_PAGE,
    skip: PER_PAGE * (page - 1)
  };

  const profile = await Profile.findOne({ login });
  const { ownedRepoIds } = profile;

  const repos = await Repo.find({ repoId: { $in: ownedRepoIds } })
    .limit(pagination.limit)
    .skip(pagination.skip);

  return res.json(repos);
};

routes.get('/:login', Authify.ensureAuth, viewProfile);
routes.get('/:login/repos', Authify.ensureAuth, viewProfileRepos);

routes.get('/add/:login', addProfile);

export default routes;
