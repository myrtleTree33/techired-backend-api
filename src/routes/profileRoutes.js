import { Router } from 'express';
import { ensureAuth } from '../utils/socialAuth';
import Profile from '../models/Profile';
import Repo from '../models/Repo';

const routes = Router();

routes.get('/:login', async (req, res, next) => {
  const { login } = req.params;
  if (!login) {
    return next('Specify a user!');
  }
  const profile = await Profile.findOne({ login });
  res.json(profile);
});

routes.get('/add/:login', async (req, res, next) => {
  const { login } = req.params;

  // depth can only be between 0 to 3
  let depth = parseInt(req.query.depth || 1, 10);
  depth = Math.min(depth, 3);
  depth = Math.max(depth, 0);

  if (!login) {
    return next('Specify a user!');
  }
  try {
    await new Profile({
      login,
      depth,
      lastScrapedAt: new Date(0)
    }).save();
    res.json({ message: 'Saved user successfully!' });
  } catch (e) {
    return next({ message: 'Error saving user.' });
  }

  // const profile = await Profile.findOne({ login });
  // res.json(profile);
});

/**
 * Retrieves all repos belonging to a certain user.
 */
routes.get('/:login/repos', async (req, res, next) => {
  const PER_PAGE = parseInt(process.env.PER_PAGE);
  const { login } = req.params;
  const page = parseInt(req.query.page || 1, 10);
  const pagination = {
    limit: PER_PAGE, // max 20
    skip: PER_PAGE * (page - 1)
  };

  if (!login) {
    return next('Specify a user!');
  }
  const profile = await Profile.findOne({ login });
  const { ownedRepoIds } = profile;
  const repos = await Repo.find({
    repoId: { $in: ownedRepoIds }
  })
    .limit(pagination.limit)
    .skip(pagination.skip);
  res.json(repos);
});

export default routes;
