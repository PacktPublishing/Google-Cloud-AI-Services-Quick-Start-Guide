import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as morgan from 'morgan';
import * as mongoose from 'mongoose';
import * as path from 'path';
import * as cors from 'cors';
import * as compression from 'compression';
import * as helmet from 'helmet';

import setRoutes from './routes';

const app = express();
dotenv.load({ path: '.env' });
app.set('port', (process.env.PORT || 3000));
// Protect the headers
app.use(helmet());
// Add CORS Headers
app.use(cors());
// Compress and spit out the content
app.use(compression());
// Serve docs
app.use('/docs', express.static(path.join(__dirname, '../docs')));
// Serve NG app
app.use('/', express.static(path.join(__dirname, '../public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let mongodbURI;
if (process.env.NODE_ENV === 'test') {
  mongodbURI = process.env.MONGODB_TEST_URI;
} else {
  mongodbURI = process.env.MONGODB_URI;
  app.use(morgan('dev'));
}

mongoose.Promise = global.Promise;
const mongodb = mongoose.connect(mongodbURI, {
  autoReconnect: true,
  keepAlive: true,
  connectTimeoutMS: 300000,
  socketTimeoutMS: 300000
});

mongodb
  .then((db) => {
    console.log('Connected to MongoDB');

    setRoutes(app);

    app.get('/*', function(req, res) {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    if (!module.parent) {
      app.listen(app.get('port'), () => {
        console.log('Smart Exchange listening on port ' + app.get('port'));
      });
    }

  })
  .catch((err) => {
    console.error(err);
  });

export { app };
