import * as express from 'express';

import ThreadCtrl from '../controllers/thread';
import Thread from '../models/thread';

import { Authenticate, Authorize } from '../auth';

export default function defineThreadRoutes(app) {

  const router = express.Router();

  const threadCtrl = new ThreadCtrl();

  // Users
  router.get('/threads', threadCtrl.getAll);
  router.get('/threads/count', threadCtrl.count);
  router.post('/thread', Authenticate, Authorize('user'), threadCtrl.insert);
  router.get('/thread/:id', threadCtrl.get);
  router.put('/thread/:id', Authenticate, Authorize('user'), threadCtrl.update);
  router.delete('/thread/:id', Authenticate, Authorize('user'), threadCtrl.delete);

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);
}
