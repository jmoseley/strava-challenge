import * as express from 'express';
import * as MongoDB from 'mongodb';

import { config } from '../../config';
import { getLogger } from '../../logger';
import UserMongoDAO from './users';
import ActivityMongoDAO from './activities';

const LOG = getLogger('lib/db');

export default async function middleware(): Promise<express.RequestHandler> {
  LOG.debug(`Connecting to database`);
  const mongodbConfig = config.get('mongodb');
  const dbClient = await MongoDB.MongoClient.connect(mongodbConfig.url);
  const db = dbClient.db(mongodbConfig.dbName);
  LOG.info(`Successfully connected to database.`);

  // TODO: Need to get some typing for this request object.
  return (req: any, res: any, next: express.NextFunction) => {
    if (!req.context || !req.context.loggerFactory) {
      throw new Error(`DB middleware must be called after logging middleware.`);
    }

    req.context.daos = {
      user: new UserMongoDAO(req.context.loggerFactory, db),
      activity: new ActivityMongoDAO(req.context.loggerFactory, db),
    };

    next();
  };
}
