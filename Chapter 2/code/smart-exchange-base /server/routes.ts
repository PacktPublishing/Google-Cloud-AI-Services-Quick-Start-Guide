import * as express from 'express';

import defineUserRoutes from './routes/user';
import defineThreadRoutes from './routes/thread';
import defineMessageRoutes from './routes/message';

export default function setRoutes(app) {

  const router = express.Router();

  defineUserRoutes(app);
  defineThreadRoutes(app);
  defineMessageRoutes(app);

}
