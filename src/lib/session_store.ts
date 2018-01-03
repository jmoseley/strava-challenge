import * as expressSession from 'express-session';

import { config } from '../config';

export function getSessionStore() {
  const MongoDBStore = require('connect-mongodb-session')(expressSession);
  return new MongoDBStore({
    uri: config.get('mongodb').url,
    collection: 'sessions',
  });
}
