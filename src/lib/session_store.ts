import * as expressSession from 'express-session';

import { config } from '../config';

// Get the session store, based on environment. Allows dev to use a local file, but prod to use something
// persistent.

export function getSessionStore() {
  if (config.get('storage_type') === 'file') {
    // Types??
    const FileStore = require('session-file-store')(expressSession);
    return new FileStore({
      path: `${process.cwd()}/.sessions`,
    });
  } else if (config.get('storage_type') === 'mongodb') {
    const MongoDBStore = require('connect-mongodb-session')(expressSession);
    return new MongoDBStore({
      uri: config.get('mongodb').url,
      collection: 'sessions',
    });
  } else {
    throw new Error(`Unsupported storage type defined. Please implement a session store for type ${config.get('storage_type')}.`);
  }
}
