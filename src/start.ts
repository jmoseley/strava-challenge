import * as express from 'express';
import * as Router from 'express-promise-router';
import { Server } from 'net';

import * as pugHandler from './handlers/pug_handler';
import { config } from './config'; 
import { getLogger, middleware as loggerMiddleware } from './logger';

const LOG = getLogger('main');

// Exported just for tests.
export async function main() {
  LOG.info('Starting server...');
  const app: express.Application = express();
  app.use(loggerMiddleware());
  app.set('view engine', 'pug');
  app.use(express.static('./public'));
  app.set('views', './views');

  const router = Router();
  router.get('/', pugHandler.index);

  app.use(router);

  const PORT = config.get('port') as number;

  // Promisify.
  const listenPromise = new Promise<Server>((resolve, reject) => {
    const server = app.listen(PORT, () => {
      LOG.info(`Server started on port ${PORT}.`);
      resolve(server);
    });
  });

  return listenPromise;
}

if (config.get('env') !== 'test') {
  main();
}
