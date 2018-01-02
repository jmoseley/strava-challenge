import * as express from 'express';
import * as MongoDB from 'mongodb';

import { config } from '../config';

export async function middleware(): Promise<express.RequestHandler> {
  const mongodbConfig = config.get('mongodb');
  const dbClient = await MongoDB.MongoClient.connect(mongodbConfig.url);
  const db = dbClient.db(mongodbConfig.dbName);

  // TODO: Need to get some typing for this request object.
  return (req: any, res: any, next: express.NextFunction) => {
    if (!req.context) {
      req.context = {};
    }
    req.context.db = db;

    next();
  }
}
