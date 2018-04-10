import * as express from 'express';

import MessageCtrl from '../controllers/message';
import Message from '../models/message';

import { Authenticate, Authorize } from '../auth';

export default function defineMessageRoutes(app) {

  const router = express.Router();

  const messageCtrl = new MessageCtrl();

  // Users
  router.post('/message', Authenticate, Authorize('user'), messageCtrl.insert);
  router.put('/message/:id', Authenticate, Authorize('user'), messageCtrl.update);
  router.delete('/message/:id', Authenticate, Authorize('user'), messageCtrl.delete);

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);
}
