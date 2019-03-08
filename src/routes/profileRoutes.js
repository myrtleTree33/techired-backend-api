import { Router } from 'express';
import { ensureAuth } from '../utils/socialAuth';
import Profile from '../models/Profile';

const routes = Router();

routes.get('/:login', async (req, res) => {
  const { login } = req.params;
  if (!login) {
    res.error('Please specify a user!');
  }
  const profile = await Profile.findOne({ login });
  res.json(profile);
});

export default routes;
