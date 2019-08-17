import { Router } from 'express';
import Authify from 'authifyjs';

const routes = Router();

routes.get('/', (req, res) => {
  res.json({ message: 'User routes backend' });
});

routes.get('/curr', Authify.ensureAuth, (req, res, next) => {
  res.json({ user: req.user });
});

export default routes;
