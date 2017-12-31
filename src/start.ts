import * as express from 'express';
import * as Router from 'express-promise-router';

import { config } from './config'; 

import { getLogger } from './logger';
import { Server } from 'net';

const LOG = getLogger('main');

// Exported just for tests.
export async function main() {
  LOG.info('Starting server...');
  const app: express.Application = express();

  const router = Router();

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
