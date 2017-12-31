import * as express from 'express';
import * as Router from 'express-promise-router';

import { config } from './config'; 

import { getLogger } from './logger';

const LOG = getLogger('main');

// Exported just for tests.
export async function main() {
  LOG.info('Starting server...');
  const app: express.Application = express();

  const router = Router();

  app.use(router);

  const PORT = config.get('port') as number;
  app.listen(PORT, () => {
    LOG.info(`Server started on port ${PORT}.`);
  });
}

main();
