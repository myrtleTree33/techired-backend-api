import { Router } from 'express';
import { ensureAuth } from '../utils/socialAuth';
import Profile from '../models/Profile';
import Repo from '../models/Repo';

const routes = Router();

/**
 * Meta search
 */
routes.get('/', async (req, res, next) => {
  const PER_PAGE = parseInt(process.env.PER_PAGE, 10);
  const { page, location } = req.query;
  const pageInt = parseInt(page || 1, 10);
  const pagination = {
    limit: PER_PAGE, // max 20
    skip: PER_PAGE * (pageInt - 1)
  };

  const profiles = await Profile.find({
    location: { $regex: `${location}`, $options: 'i' }
  })
    .limit(pagination.limit)
    .skip(pagination.skip);
  res.json(profiles);
});

export default routes;
