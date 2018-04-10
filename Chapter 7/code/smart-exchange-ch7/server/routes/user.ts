import * as express from 'express';

import UserCtrl from '../controllers/user';
import User from '../models/user';

import { Authenticate, Authorize } from '../auth';

export default function defineUserRoutes(app) {
  const router = express.Router();
  const userCtrl = new UserCtrl();

  // Users
  router.post('/login', userCtrl.login);
  router.get('/users', Authenticate, Authorize('admin'), userCtrl.getAll);
  router.get('/users/count', Authenticate, Authorize('admin'), userCtrl.count);
  router.post('/register', userCtrl.insert);
  router.get('/user/:id', Authenticate, Authorize('user'), userCtrl.get);
  router.put('/user/:id', Authenticate, Authorize('user'), userCtrl.update);
  router.delete('/user/:id', Authenticate, Authorize('admin'), userCtrl.delete);

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);
}
